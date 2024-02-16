import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ID } from '@vendure/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Observable, map } from 'rxjs';
import {
  SharedModule,
  CustomDetailComponent,
  DataService,
  ModalService,
  TypedBaseDetailComponent,
} from '@vendure/admin-ui/core';
import {
  CreateProductDetailsDocument,
  ProductDetailsDocument,
  GetProductTypesForProductQuery,
} from '../generated-admin-types';

@Component({
  templateUrl: `./product-type.component.html`,
  standalone: true,
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTypeComponent
  extends TypedBaseDetailComponent<
    typeof ProductDetailsDocument,
    'productAdditionalDetailsForProduct'
  >
  implements CustomDetailComponent, OnInit
{
  entity$: Observable<any>;
  detailForm: FormGroup;
  productId: ID;
  element$: HTMLElement;
  productId$: ID;
  @ViewChild('.btn.btn-primary', { static: true })
  createButton: ElementRef;

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    super();
  }

  ngAfterViewInit() {
    this.element$ = this.renderer.selectRootElement('.btn.btn-primary', true);

    const productId = this.dataService.product.getProducts({}).single$.pipe(
      map(({ products }) => {
        if (products) {
          return products.items?.filter(({ id }, index) => {
            return index === products.items?.length - 1;
          })[0]?.id;
        }
        return 1;
      })
    );

    productId.subscribe((value) => {
      this.productId$ = +value + 1;
    });

    const entityId = this.route.snapshot.params.id ?? '';
    if (entityId !== 'create') {
      this.productId = entityId as ID;
      const el = this.renderer.selectRootElement('#update-details-btn');

      el.style.display = 'block';
      el.innerHTML = 'Update Details';

      el.addEventListener('click', () => {
        this.dataService
          .mutate(CreateProductDetailsDocument, {
            input: {
              ...this.detailForm.value,
              repetitions: this.repetitionsFormArray.controls.map(
                (item) => item.value.repetition
              ),
            },
          })
          .subscribe()
          .add(() => this.emptyData());
      });
      this.loadProductAdditionalDetails(entityId)
    } else {
      this.element$.innerHTML = 'Create';
      this.element$.addEventListener('click', (event) => {
        setTimeout(() => {
          this.dataService
            .mutate(CreateProductDetailsDocument, {
              input: {
                ...this.detailForm.value,
                productId: this.productId$,
                repetitions: this.repetitionsFormArray.controls.map(
                  (item) => item.value.repetition
                ),
              },
            })
            .subscribe()
            .add(() => this.emptyData());
        }, 2000);
      });
    }
  }

  get repetitionsFormArray() {
    return this.detailForm.get('repetitions') as FormArray;
  }

  ngOnInit() {
    this.detailForm = this.fb.group({
      slogan: [''],
      alternateName: [''],
      additionalType: [''],
      disambiguatingDescription: [''],
      oneWordName: [''],
      isService: [false],
      serviceOutput: [''],
      serviceType: [''],
      repetitions: this.fb.array([]),
      transmissionDays: [0],
      durationUnit: ['Days'],
      meta_title: [''],
      meta_keyword: [''],
      meta_description: [''],
    });
  }

  emptyData() {
    this.detailForm.patchValue({
      slogan: [''],
      alternateName: [''],
      additionalType: [''],
      disambiguatingDescription: [''],
      oneWordName: [''],
      isService: [false],
      serviceOutput: [''],
      serviceType: [''],
      repetitions: this.fb.array([]),
      transmissionDays: [0],
      durationUnit: ['Days'],
      meta_title: [''],
      meta_keyword: [''],
      meta_description: [''],
    });
  }

  createRepetitionGroup(): FormGroup {
    return this.fb.group({
      repetition: [0, Validators.required],
    });
  }

  protected loadProductAdditionalDetails(productId: ID) {
    this.dataService
      .query<GetProductTypesForProductQuery>(ProductDetailsDocument, { id: productId }) // Update the query type
      .mapSingle((data) => data.productAdditionalDetailsForProduct)
      .subscribe((data) => {
        console.log(data);

        if (data) {
          this.setFormValues(data, 'en');
          this.repetitionsFormArray.clear();
          data?.repetitions.forEach((repetition) => {
              this.repetitionsFormArray.push(
                  new FormGroup({
                      repetition: new FormControl(repetition, Validators.required)
                  })
              );
          });
        }
      });
  }

  addRepetitions() {
    this.repetitionsFormArray.controls.push(
      new FormGroup({
        repetition: new FormControl('', Validators.required), // Changed key name
      })
    );
  }

  removeRepetitions(index: number) {
    (this.repetitionsFormArray as FormArray).removeAt(index);
  }

  protected setFormValues(entity: any, languageCode: any): void {
    this.detailForm.patchValue({
      slogan: entity.slogan,
      additionalType: entity.additionalType,
      alternateName: entity.alternateName,
      disambiguatingDescription: entity.disambiguatingDescription,
      isService: entity.isService,
      meta_description: entity.meta_description,
      meta_title: entity.meta_title,
      meta_keyword: entity.meta_keyword,
      oneWordName: entity.oneWordName,
      // repetitions: entity.repetitions.map((item: any) => item.repetition),
      serviceOutput: entity.serviceOutput,
      serviceType: entity.serviceType,
    });
  }
}
