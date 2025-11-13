/**
 * Sample Manufacturing Data for FlowCore Demo
 * Based on typical tire manufacturing operations
 */

export const sampleProductionData = [
  {
    date: '2025-01-10',
    plant: 'plant-a',
    batchNumber: 'BATCH-2025-001',
    tireSize: '195/65R15',
    shiftType: '3-shift',
    curingA: 850,
    curingB: 45,
    curingR: 5,
    target: 900,
    supervisorName: 'John Smith'
  },
  {
    date: '2025-01-10',
    plant: 'plant-b',
    batchNumber: 'BATCH-2025-002',
    tireSize: '205/55R16',
    shiftType: '3-shift',
    curingA: 720,
    curingB: 35,
    curingR: 8,
    target: 750,
    supervisorName: 'Sarah Johnson'
  },
  {
    date: '2025-01-11',
    plant: 'plant-a',
    batchNumber: 'BATCH-2025-003',
    tireSize: '225/45R17',
    shiftType: '3-shift',
    curingA: 680,
    curingB: 28,
    curingR: 4,
    target: 700,
    supervisorName: 'John Smith'
  },
  {
    date: '2025-01-11',
    plant: 'plant-b',
    batchNumber: 'BATCH-2025-004',
    tireSize: '195/65R15',
    shiftType: '3-shift',
    curingA: 890,
    curingB: 52,
    curingR: 6,
    target: 950,
    supervisorName: 'Sarah Johnson'
  },
  {
    date: '2025-01-12',
    plant: 'plant-a',
    batchNumber: 'BATCH-2025-005',
    tireSize: '215/60R16',
    shiftType: '3-shift',
    curingA: 760,
    curingB: 38,
    curingR: 7,
    target: 800,
    supervisorName: 'John Smith'
  }
];

export const sampleUsers = [
  {
    id: 'demo-admin',
    name: 'Demo Admin',
    role: 'admin',
    plant: 'both',
    department: 'all'
  },
  {
    id: 'demo-executive',
    name: 'Demo Executive',
    role: 'executive',
    plant: 'both',
    department: 'all'
  },
  {
    id: 'demo-manager',
    name: 'Demo Manager',
    role: 'manager',
    plant: 'plant-a',
    department: 'production'
  },
  {
    id: 'demo-supervisor',
    name: 'Demo Supervisor',
    role: 'supervisor',
    plant: 'plant-a',
    department: 'production'
  }
];

export const sampleKPIs = {
  totalProduction: 3900,
  qualityRate: 96.2,
  defectRate: 3.8,
  efficiency: 94.5,
  plantAProduction: 2290,
  plantBProduction: 1610,
  monthlyTarget: 25000,
  currentProgress: 15.6
};

