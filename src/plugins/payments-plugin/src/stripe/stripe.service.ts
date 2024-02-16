import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigArg } from '@vendure/common/lib/generated-types';
import {
    Ctx,
    Customer,
    Injector,
    Logger,
    Order,
    Payment,
    PaymentMethodService,
    RequestContext,
    TransactionalConnection,
    UserInputError,
} from '@vendure/core';
import Stripe from 'stripe';

import { loggerCtx, STRIPE_PLUGIN_OPTIONS } from './constants';
import { sanitizeMetadata } from './metadata-sanitize';
import { VendureStripeClient } from './stripe-client';
import { getAmountInStripeMinorUnits } from './stripe-utils';
import { stripePaymentMethodHandler } from './stripe.handler';
import { StripePluginOptions } from './types';

@Injectable()
export class StripeService {
    constructor(
        private connection: TransactionalConnection,
        private paymentMethodService: PaymentMethodService,
        @Inject(STRIPE_PLUGIN_OPTIONS) private options: StripePluginOptions,
        private moduleRef: ModuleRef,
    ) { }

    async createPaymentIntent(ctx: RequestContext, order: Order): Promise<string> {
        let customerId: string | undefined;
        const stripe = await this.getStripeClient(ctx, order);

        const customer = await this.connection.getRepository(ctx, Customer).findOne({ where: { id: order.customerId } });

        if (this.options.storeCustomersInStripe && ctx.activeUserId && customer) {
            customerId = await this.getStripeCustomerId(ctx, order, customer);
        }
        const amountInMinorUnits = getAmountInStripeMinorUnits(order);

        const metadata = sanitizeMetadata({
            ...(typeof this.options.metadata === 'function'
                ? await this.options.metadata(new Injector(this.moduleRef), ctx, order)
                : {}),
            channelToken: ctx.channel.token,
            orderId: order.id,
            orderCode: order.code,
        });



        console.log('order', order, customer);



        const { client_secret } = await stripe.paymentIntents.create(
            {
                amount: amountInMinorUnits,
                currency: order.currencyCode.toLowerCase(),
                customer: customerId,
                automatic_payment_methods: {
                    enabled: true,
                },
                description: `Order #${order.code} for ${customer?.emailAddress}`,
                metadata,
            },
            { idempotencyKey: `${order.code}_${amountInMinorUnits}` },
        );

        if (!client_secret) {
            // This should never happen
            Logger.warn(
                `Payment intent creation for order ${order.code} did not return client secret`,
                loggerCtx,
            );
            throw Error('Failed to create payment intent');
        }

        return client_secret ?? undefined;
    }

    async constructEventFromPayload(
        ctx: RequestContext,
        order: Order,
        payload: Buffer,
        signature: string,
    ): Promise<Stripe.Event> {
        const stripe = await this.getStripeClient(ctx, order);
        return stripe.webhooks.constructEvent(payload, signature, stripe.webhookSecret);
    }

    async createRefund(
        ctx: RequestContext,
        order: Order,
        payment: Payment,
        amount: number,
    ): Promise<Stripe.Response<Stripe.Refund>> {
        const stripe = await this.getStripeClient(ctx, order);
        return stripe.refunds.create({
            payment_intent: payment.transactionId,
            amount,
        });
    }

    /**
     * Get Stripe client based on eligible payment methods for order
     */
    async getStripeClient(ctx: RequestContext, order: Order): Promise<VendureStripeClient> {
        const [eligiblePaymentMethods, paymentMethods] = await Promise.all([
            this.paymentMethodService.getEligiblePaymentMethods(ctx, order),
            this.paymentMethodService.findAll(ctx, {
                filter: {
                    enabled: { eq: true },
                },
            }),
        ]);
        const stripePaymentMethod = paymentMethods.items.find(
            pm => pm.handler.code === stripePaymentMethodHandler.code,
        );
        if (!stripePaymentMethod) {
            throw new UserInputError('No enabled Stripe payment method found');
        }
        const isEligible = eligiblePaymentMethods.some(pm => pm.code === stripePaymentMethod.code);
        if (!isEligible) {
            throw new UserInputError(`Stripe payment method is not eligible for order ${order.code}`);
        }
        const apiKey = this.findOrThrowArgValue(stripePaymentMethod.handler.args, 'apiKey');
        const webhookSecret = this.findOrThrowArgValue(stripePaymentMethod.handler.args, 'webhookSecret');
        return new VendureStripeClient(apiKey, webhookSecret);
    }

    private findOrThrowArgValue(args: ConfigArg[], name: string): string {
        const value = args.find(arg => arg.name === name)?.value;
        if (!value) {
            throw Error(`No argument named '${name}' found!`);
        }
        return value;
    }

    /**
     * Returns the stripeCustomerId if the Customer has one. If that's not the case, queries Stripe to check
     * if the customer is already registered, in which case it saves the id as stripeCustomerId and returns it.
     * Otherwise, creates a new Customer record in Stripe and returns the generated id.
     */
    private async getStripeCustomerId(ctx: RequestContext, activeOrder: Order, customer: Customer): Promise<string | undefined> {
        const [stripe, order] = await Promise.all([
            this.getStripeClient(ctx, activeOrder),
            // Load relation with customer not available in the response from activeOrderService.getOrderFromContext()
            this.connection.getRepository(ctx, Order).findOne({
                where: { id: activeOrder.id },
                relations: ['customer'],
            }),
        ]);

        if (!order) {
            //     // This should never happen
            return undefined;
            //     customer = order.customer
        }

        // const { customer } = order;

        // if (customer.customFields.stripeCustomerId) {
        //     return customer.customFields.stripeCustomerId;
        // }

        let stripeCustomerId;

        const stripeCustomers = await stripe.customers.list({ email: customer.emailAddress });
        // cons
        if (stripeCustomers.data.length > 0) {
            if (!stripeCustomers.data[0].address) {
                if(!customer.addresses){
                    customer.addresses = [];
                }
                await stripe.customers.update(stripeCustomers.data[0].id, {
                    address: {
                        line1: customer.addresses[0]?.streetLine1 || order.shippingAddress?.streetLine1,
                        postal_code: customer.addresses[0]?.postalCode || order.shippingAddress?.postalCode,
                        city: customer.addresses[0]?.city || order.shippingAddress?.city,
                        state: customer.addresses[0]?.province || order.shippingAddress?.province,
                        country: customer.addresses[0]?.country?.code || order.shippingAddress?.countryCode,
                    },
                });
            }
            console.log(stripeCustomers.data[0]);
            stripeCustomerId = stripeCustomers.data[0].id;
        } else {
            const newStripeCustomer = await stripe.customers.create({
                email: customer.emailAddress,
                name: `${customer.firstName} ${customer.lastName}`,
                address: {
                    line1: customer.addresses[0]?.streetLine1 || order.shippingAddress?.streetLine1,
                    postal_code: customer.addresses[0]?.postalCode || order.shippingAddress?.postalCode,
                    city: customer.addresses[0]?.city || order.shippingAddress?.city,
                    state: customer.addresses[0]?.province || order.shippingAddress?.province,
                    country: customer.addresses[0]?.country.code || order.shippingAddress?.countryCode,
                },
            });

            stripeCustomerId = newStripeCustomer.id;

            Logger.info(`Created Stripe Customer record for customerId ${customer.id}`, loggerCtx);
        }

        customer.customFields.stripeCustomerId = stripeCustomerId;
        await this.connection.getRepository(ctx, Customer).save(customer, { reload: false });

        return stripeCustomerId;
    }
}
