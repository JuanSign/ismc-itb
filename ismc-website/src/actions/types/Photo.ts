
export type PhotoMember = {
  account_id: string;
  email: string;
  
  name: string | null;
  institution: string | null;
  phone_num: string | null;
  id_no: string | null;
  
  sc_link: string | null;
  sc_verified: number;
  
  fp_link: string | null;
  fp_verified: number;

  pp_link: string | null;
  pp_verified: number;

  sd_link: string | null; // Photo File
  sdd: string | null;     // Description/Title/Theme
  sub_verified: number;

  od_link: string | null; // Originality
  od_verified: number;
  
  status: number;
  notes: string[] | null;
};

export type RegisterPhotoState = { error?: string; };
export type UpdateMemberFormState = { error?: string; message?: string; };
export type UpdateBillingFormState = { error?: string; message?: string; };
export type UploadDocsFormState = { error?: string; message?: string; }; 
export type SubmitPhotoFormState = { error?: string; message?: string; };