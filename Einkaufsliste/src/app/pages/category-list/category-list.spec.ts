import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { CategoryList } from './category-list';
import { CategoryDialog } from '../../components/category-dialog/category-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { Category } from '../../data/category';
import { CategoryService } from '../../service/category.service';

describe('CategoryList', () => {
  let component: CategoryList;
  let fixture: ComponentFixture<CategoryList>;
  let serviceStub: {
    getList: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let dialog: MatDialog;
  let snackBar: MatSnackBar;

  const categories: Category[] = [{ id: 1, name: 'Obst', description: '', color: '#4a90d9' }];

  beforeEach(async () => {
    serviceStub = {
      getList: vi.fn().mockReturnValue(of(categories)),
      save: vi.fn().mockReturnValue(of(categories[0])),
      update: vi.fn().mockReturnValue(of(categories[0])),
      delete: vi.fn().mockReturnValue(of({ status: 200 })),
    };

    await TestBed.configureTestingModule({
      imports: [CategoryList],
      providers: [{ provide: CategoryService, useValue: serviceStub }],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryList);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialog = TestBed.inject(MatDialog);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should create and load the categories', () => {
    expect(component).toBeTruthy();
    expect(serviceStub.getList).toHaveBeenCalled();
    expect(component.categoriesDataSource.data).toEqual(categories);
  });

  it('add should open the category dialog and save on confirmation', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(categories[0]) } as never);

    component.add();

    expect(dialog.open).toHaveBeenCalledWith(CategoryDialog, expect.objectContaining({ data: new Category() }));
    expect(serviceStub.save).toHaveBeenCalledWith(categories[0]);
  });

  it('add should do nothing when the dialog is dismissed', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(undefined) } as never);

    component.add();

    expect(serviceStub.save).not.toHaveBeenCalled();
  });

  it('edit should open the category dialog and update on confirmation', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(categories[0]) } as never);

    component.edit(categories[0]);

    expect(dialog.open).toHaveBeenCalledWith(CategoryDialog, expect.objectContaining({ data: { ...categories[0] } }));
    expect(serviceStub.update).toHaveBeenCalledWith(categories[0]);
  });

  it('delete should open the confirm dialog and delete on confirmation', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);
    const snackSpy = vi.spyOn(snackBar, 'open');

    component.delete(categories[0]);

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialog, expect.any(Object));
    expect(serviceStub.delete).toHaveBeenCalledWith(categories[0].id);
    expect(snackSpy).toHaveBeenCalled();
  });

  it('delete should not call the service when dismissed', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as never);

    component.delete(categories[0]);

    expect(serviceStub.delete).not.toHaveBeenCalled();
  });

  it('delete should show an error message when the service reports a non-200 status', () => {
    serviceStub.delete.mockReturnValue(of({ status: 500 }));
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);
    const snackSpy = vi.spyOn(snackBar, 'open');

    component.delete(categories[0]);

    expect(snackSpy).toHaveBeenCalledWith('Es ist ein Fehler aufgetreten.', '', { duration: 4000 });
  });
});
