export interface HotelCategoryModel {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  added: string;
}

export interface HotelCategoryFormValue {
  title: string;
  description: string;
  isActive: boolean;
}
