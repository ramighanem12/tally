export interface Matrix {
  id: string;
  name: string;
  updated_at: string;
  engagement: string | null;
  access: string | null;
}

export const DUMMY_MATRICES: Matrix[] = [
  {
    id: '1',
    name: 'SOC 2 Control Matrix',
    updated_at: new Date().toISOString(),
    engagement: null,
    access: null
  },
  {
    id: '2',
    name: 'ISO 27001 Controls',
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    engagement: null,
    access: null
  },
  {
    id: '3',
    name: 'NIST CSF Matrix',
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    engagement: null,
    access: null
  }
]; 