export interface CsvRow {
  'First Name': string;
  'Last Name': string;
  Company: string;
  City: string;
  Country: string;
  'Phone 1': string;
  'Phone 2': string;
  Email: string;
  'Subscription Date': string;
  Website: string;
}

export interface TableRecord {
  first_name: string;
  last_name: string;
  company: string;
  city: string;
  country: string;
  phone_1: string;
  phone_2: string;
  email: string;
  subscription_date: string;
  website: string;
}

export const TableName = 'records';

export const TransformData = (row: CsvRow): TableRecord => ({
  first_name: row['First Name'],
  last_name: row['Last Name'],
  company: row['Company'],
  city: row['City'],
  country: row['Country'],
  phone_1: row['Phone 1'],
  phone_2: row['Phone 2'],
  email: row['Email'],
  subscription_date: row['Subscription Date'],
  website: row['Website'],
});