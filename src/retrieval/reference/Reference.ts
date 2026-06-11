export interface Reference {
  id: string;
  title: string;
  type: string;
  source: string;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}
