import { Column, Entity, OneToOne, JoinColumn , OneToMany } from 'typeorm';
import { DeepPartial, ID, Product, VendureEntity } from '@vendure/core';

enum DurationUnit {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
}

@Entity()
export class ProductType extends VendureEntity {
  constructor(input?: DeepPartial<ProductType>) {
    super(input);
  }

  @Column({ default: '' })
  slogan: string;

  @Column({ default: '' })
  alternateName: string;

  @Column({ default: '' })
  disambiguatingDescription: string;

  @Column({ default: '' })
  additionalType: string;

  @Column({ default: false })
  isService: boolean;

  @Column({ default: '' })
  Keywords: string;

  @Column({ default: '' })
  serviceOutput: string;

  @Column({ default: '' })
  serviceType: string;

  @Column({ default: '' })
  meta_title: string;

  @Column({ default: '' })
  meta_keyword: string;

  @Column({ default: '' })
  meta_description: string;

  @Column({ type: 'jsonb', nullable: true })
  repetitions: number[]; 

  @Column({ default: '' })
  oneWordName: string;

  @Column({ default: 0 })
  transmissionDay: number;

  @Column({ default: DurationUnit.DAYS })
  durationUnit: DurationUnit;

  @Column()
  productId: ID;

  @OneToOne(() => Product)
  @JoinColumn()
  product: Product;
}
