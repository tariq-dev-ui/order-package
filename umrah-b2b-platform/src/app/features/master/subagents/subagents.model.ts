export interface AgentModel {
  AgentID?: number;
  AgentName?: string;
  AgentCode?: string;
  AgentEmail?: string;
  CountryID?: number;
  CountryName?: string;
  CityID?: number;
  CityName?: string;
  LogoImageLocation?: string;
  CR_NO?: string;
  Address?: string;
  Description?: string;
  IsActive?: boolean;
  MasterAgentID?: number | null;
  MasterAgentName?: string;
}

export interface UserAccountViewModel {
  UserID?: number;
  UserName?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  PhoneNumber?: string;
  IsActive?: boolean;
  UserOwnerID?: number;
  UserTypeID?: number;
  AddedDate?: string;
  LastUpdatedDate?: string;
  AddedBy?: string;
}

export interface UserViewModel {
  UserID?: number;
  UserName?: string;
  Email?: string;
  Mobile?: string;
  FirstName?: string;
  LastName?: string;
  Password?: string;
  IsActive?: boolean;
  IsAdmin?: boolean;
  UserTypeID?: number;
  UserOwnerID?: number | null;
  UserSystemGroupIDs?: number[];
}

export interface CountryData {
  CountryID?: number;
  Title?: string;
  TitleEnglish?: string;
}

export interface CityData {
  CityID?: number;
  Name?: string;
  NameEn?: string;
  CountryID?: number;
}
