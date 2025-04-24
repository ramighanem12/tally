export interface ChecklistItem {
  id: string;
  name: string;
  reviewer: string;
  dueDate: Date;
  status: string;
  tasks_completed: number;
  tasks_total: number;
}

export interface ChecklistSection {
  id: string;
  name: string;
  isSection: true;
  items: ChecklistItem[];
}

export type ChecklistEntry = ChecklistItem | ChecklistSection; 