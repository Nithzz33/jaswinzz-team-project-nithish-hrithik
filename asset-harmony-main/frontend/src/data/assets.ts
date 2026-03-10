export type AssetCondition = "New" | "Good" | "Fair" | "Poor" | "Decommissioned";
export type AssetCategory = "IT Equipment" | "Office Furniture" | "Appliances" | "Consumables" | "AV Equipment" | "Party Decorations" | "Catering Equipment" | "AV & Entertainment";

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: AssetCategory;
  location: string;
  building: string;
  floor: string;
  room: string;
  department: string;
  vendor: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  condition: AssetCondition;
  lastAuditDate: string;
  auditStatus: "Verified" | "Pending" | "Discrepancy";
}

export const CATEGORIES: AssetCategory[] = ["IT Equipment", "Office Furniture", "Appliances", "Consumables", "AV Equipment", "Party Decorations", "Catering Equipment", "AV & Entertainment"];
export const CONDITIONS: AssetCondition[] = ["New", "Good", "Fair", "Poor", "Decommissioned"];

export const LOCATIONS = [
  { building: "HQ Building", floors: ["Floor 1", "Floor 2", "Floor 3"], rooms: ["Room 101", "Room 102", "Room 201", "Room 205", "Room 301"] },
  { building: "Annex Building", floors: ["Floor 1", "Floor 2"], rooms: ["Room A1", "Room A2", "Room B1"] },
  { building: "Warehouse", floors: ["Ground"], rooms: ["Bay 1", "Bay 2", "Storage"] },
];

export const DEPARTMENTS = ["IT", "Finance", "HR", "Operations", "Marketing", "Executive"];

let nextId = 48;
export const generateAssetId = () => {
  nextId++;
  return `AST-${String(nextId).padStart(5, "0")}`;
};

export const sampleAssets: Asset[] = [
  { id: "1", assetId: "AST-00001", name: 'Dell Latitude 5540 Laptop', category: "IT Equipment", location: "HQ Building – Floor 2 – Room 205", building: "HQ Building", floor: "Floor 2", room: "Room 205", department: "IT", vendor: "Dell Technologies", model: "Latitude 5540", serialNumber: "DL5540-X9K2M", purchaseDate: "2024-03-15", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "2", assetId: "AST-00002", name: 'HP LaserJet Pro MFP', category: "IT Equipment", location: "HQ Building – Floor 1 – Room 101", building: "HQ Building", floor: "Floor 1", room: "Room 101", department: "Operations", vendor: "HP Inc.", model: "LaserJet Pro M428fdw", serialNumber: "HP428-Q3R7T", purchaseDate: "2023-11-20", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "3", assetId: "AST-00003", name: 'Herman Miller Aeron Chair', category: "Office Furniture", location: "HQ Building – Floor 3 – Room 301", building: "HQ Building", floor: "Floor 3", room: "Room 301", department: "Executive", vendor: "Herman Miller", model: "Aeron Size B", serialNumber: "HM-AER-2024-001", purchaseDate: "2024-01-10", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "4", assetId: "AST-00004", name: 'Standing Desk – Electric', category: "Office Furniture", location: "HQ Building – Floor 2 – Room 205", building: "HQ Building", floor: "Floor 2", room: "Room 205", department: "IT", vendor: "Uplift Desk", model: "V2 Commercial", serialNumber: "UPL-V2C-7821", purchaseDate: "2024-06-01", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "5", assetId: "AST-00005", name: 'Samsung 4K Monitor 27"', category: "IT Equipment", location: "HQ Building – Floor 2 – Room 205", building: "HQ Building", floor: "Floor 2", room: "Room 205", department: "IT", vendor: "Samsung", model: "U28R550UQN", serialNumber: "SAM-28R-K4521", purchaseDate: "2024-03-15", condition: "Good", lastAuditDate: "2026-01-15", auditStatus: "Pending" },
  { id: "6", assetId: "AST-00006", name: 'Nespresso Coffee Machine', category: "Appliances", location: "HQ Building – Floor 1 – Room 102", building: "HQ Building", floor: "Floor 1", room: "Room 102", department: "Operations", vendor: "Nespresso", model: "Vertuo Next", serialNumber: "NSP-VN-3382", purchaseDate: "2025-01-05", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "7", assetId: "AST-00007", name: 'Cisco IP Phone 8845', category: "IT Equipment", location: "Annex Building – Floor 1 – Room A1", building: "Annex Building", floor: "Floor 1", room: "Room A1", department: "Finance", vendor: "Cisco", model: "IP Phone 8845", serialNumber: "CSC-8845-P9201", purchaseDate: "2023-08-12", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "8", assetId: "AST-00008", name: 'Epson Projector EB-992F', category: "AV Equipment", location: "HQ Building – Floor 3 – Room 301", building: "HQ Building", floor: "Floor 3", room: "Room 301", department: "Executive", vendor: "Epson", model: "EB-992F", serialNumber: "EPS-992-F4410", purchaseDate: "2024-09-01", condition: "Good", lastAuditDate: "2026-01-15", auditStatus: "Pending" },
  { id: "9", assetId: "AST-00009", name: 'Paper Shredder – Cross Cut', category: "Appliances", location: "Annex Building – Floor 2 – Room B1", building: "Annex Building", floor: "Floor 2", room: "Room B1", department: "HR", vendor: "Fellowes", model: "Powershred 79Ci", serialNumber: "FLW-79C-8833", purchaseDate: "2022-05-20", condition: "Fair", lastAuditDate: "2026-02-28", auditStatus: "Discrepancy" },
  { id: "10", assetId: "AST-00010", name: 'Whiteboard – Mobile 48x72', category: "Office Furniture", location: "HQ Building – Floor 1 – Room 101", building: "HQ Building", floor: "Floor 1", room: "Room 101", department: "Operations", vendor: "Quartet", model: "Prestige 2 Mobile", serialNumber: "QRT-P2M-2244", purchaseDate: "2023-03-10", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "11", assetId: "AST-00011", name: 'MacBook Pro 16" M3 Max', category: "IT Equipment", location: "HQ Building – Floor 3 – Room 301", building: "HQ Building", floor: "Floor 3", room: "Room 301", department: "Executive", vendor: "Apple", model: "MacBook Pro 16 M3 Max", serialNumber: "APL-MBP16-C7741", purchaseDate: "2025-02-01", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "12", assetId: "AST-00012", name: 'Filing Cabinet 4-Drawer', category: "Office Furniture", location: "Annex Building – Floor 1 – Room A2", building: "Annex Building", floor: "Floor 1", room: "Room A2", department: "Finance", vendor: "HON", model: "510 Series", serialNumber: "HON-510-1198", purchaseDate: "2021-07-15", condition: "Fair", lastAuditDate: "2026-01-15", auditStatus: "Pending" },
  // Party Decorations
  { id: "13", assetId: "AST-00013", name: 'LED Balloon Arch Kit', category: "Party Decorations", location: "Warehouse – Ground – Bay 1", building: "Warehouse", floor: "Ground", room: "Bay 1", department: "Operations", vendor: "PartyCity", model: "LED Arch 12ft", serialNumber: "PC-ARCH-5501", purchaseDate: "2025-06-10", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "14", assetId: "AST-00014", name: 'Fabric Banner Set (Happy Birthday)', category: "Party Decorations", location: "Warehouse – Ground – Bay 1", building: "Warehouse", floor: "Ground", room: "Bay 1", department: "Operations", vendor: "FestiveSupply", model: "FB-HB-200", serialNumber: "FS-BNRHB-3301", purchaseDate: "2025-04-20", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "15", assetId: "AST-00015", name: 'String Lights – Warm White 100ft', category: "Party Decorations", location: "Warehouse – Ground – Bay 2", building: "Warehouse", floor: "Ground", room: "Bay 2", department: "Operations", vendor: "BrightLights Co.", model: "SL-WW-100", serialNumber: "BL-WW100-7712", purchaseDate: "2025-01-15", condition: "Good", lastAuditDate: "2026-01-15", auditStatus: "Pending" },
  { id: "16", assetId: "AST-00016", name: 'Table Runner Gold Sequin (10 pcs)', category: "Party Decorations", location: "Warehouse – Ground – Storage", building: "Warehouse", floor: "Ground", room: "Storage", department: "Operations", vendor: "FestiveSupply", model: "TR-GS-10", serialNumber: "FS-TRGS-9902", purchaseDate: "2025-08-01", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  // Catering Equipment
  { id: "17", assetId: "AST-00017", name: 'Chafing Dish Set (6-pack)', category: "Catering Equipment", location: "Warehouse – Ground – Bay 2", building: "Warehouse", floor: "Ground", room: "Bay 2", department: "Operations", vendor: "CaterPro", model: "CD-SS-6PK", serialNumber: "CP-CD6-1123", purchaseDate: "2024-11-05", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "18", assetId: "AST-00018", name: 'Disposable Plates – Gold Rim (200)', category: "Catering Equipment", location: "Warehouse – Ground – Storage", building: "Warehouse", floor: "Ground", room: "Storage", department: "Operations", vendor: "ElegantDine", model: "DP-GR-200", serialNumber: "ED-DPGR-4451", purchaseDate: "2025-09-15", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "19", assetId: "AST-00019", name: 'Beverage Dispenser 3-Gallon', category: "Catering Equipment", location: "Warehouse – Ground – Bay 1", building: "Warehouse", floor: "Ground", room: "Bay 1", department: "Operations", vendor: "CaterPro", model: "BD-3G-CLR", serialNumber: "CP-BD3G-6678", purchaseDate: "2024-07-20", condition: "Fair", lastAuditDate: "2026-01-15", auditStatus: "Discrepancy" },
  { id: "20", assetId: "AST-00020", name: 'Cutlery Set – Silver Plastic (300)', category: "Catering Equipment", location: "Warehouse – Ground – Storage", building: "Warehouse", floor: "Ground", room: "Storage", department: "Operations", vendor: "ElegantDine", model: "CS-SP-300", serialNumber: "ED-CSSP-2234", purchaseDate: "2025-10-01", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  // AV & Entertainment
  { id: "21", assetId: "AST-00021", name: 'Portable PA Speaker System', category: "AV & Entertainment", location: "Warehouse – Ground – Bay 2", building: "Warehouse", floor: "Ground", room: "Bay 2", department: "Operations", vendor: "JBL Professional", model: "EON715", serialNumber: "JBL-EON-88432", purchaseDate: "2025-03-10", condition: "New", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "22", assetId: "AST-00022", name: 'Wireless Microphone Kit (2-pack)', category: "AV & Entertainment", location: "Warehouse – Ground – Bay 2", building: "Warehouse", floor: "Ground", room: "Bay 2", department: "Operations", vendor: "Shure", model: "BLX288/PG58", serialNumber: "SHR-BLX-22901", purchaseDate: "2025-02-20", condition: "Good", lastAuditDate: "2026-02-28", auditStatus: "Verified" },
  { id: "23", assetId: "AST-00023", name: 'Photo Booth Backdrop & Props Kit', category: "AV & Entertainment", location: "Warehouse – Ground – Storage", building: "Warehouse", floor: "Ground", room: "Storage", department: "Operations", vendor: "SnapFun", model: "PB-DLX-100", serialNumber: "SF-PBDLX-5543", purchaseDate: "2025-05-01", condition: "Good", lastAuditDate: "2026-01-15", auditStatus: "Pending" },
  { id: "24", assetId: "AST-00024", name: 'Fog Machine – 1500W', category: "AV & Entertainment", location: "Warehouse – Ground – Bay 1", building: "Warehouse", floor: "Ground", room: "Bay 1", department: "Operations", vendor: "ChauvetDJ", model: "Hurricane 1800", serialNumber: "CVT-H1800-3367", purchaseDate: "2024-12-15", condition: "Fair", lastAuditDate: "2026-02-28", auditStatus: "Discrepancy" },
];

export interface ReorderItem {
  id: string;
  name: string;
  category: AssetCategory;
  vendor: string;
  unitPrice: number;
  minStock: number;
  currentStock: number;
  vendorEmail: string;
}

export const reorderCatalog: ReorderItem[] = [
  { id: "r1", name: "Helium Balloons (100 pack)", category: "Party Decorations", vendor: "PartyCity", unitPrice: 45.00, minStock: 5, currentStock: 2, vendorEmail: "orders@partycity.com" },
  { id: "r2", name: "Fabric Banners – Festival Theme", category: "Party Decorations", vendor: "FestiveSupply", unitPrice: 28.00, minStock: 10, currentStock: 3, vendorEmail: "sales@festivesupply.com" },
  { id: "r3", name: "LED String Lights 50ft", category: "Party Decorations", vendor: "BrightLights Co.", unitPrice: 35.00, minStock: 8, currentStock: 1, vendorEmail: "bulk@brightlights.com" },
  { id: "r4", name: "Tablecloths – Gold (20 pack)", category: "Party Decorations", vendor: "FestiveSupply", unitPrice: 60.00, minStock: 4, currentStock: 4, vendorEmail: "sales@festivesupply.com" },
  { id: "r5", name: "Streamers Multicolor (50 rolls)", category: "Party Decorations", vendor: "PartyCity", unitPrice: 22.00, minStock: 6, currentStock: 0, vendorEmail: "orders@partycity.com" },
  { id: "r6", name: "Disposable Plates – Gold Rim (200)", category: "Catering Equipment", vendor: "ElegantDine", unitPrice: 55.00, minStock: 3, currentStock: 1, vendorEmail: "orders@elegantdine.com" },
  { id: "r7", name: "Chafing Dish Fuel Cans (24 pk)", category: "Catering Equipment", vendor: "CaterPro", unitPrice: 40.00, minStock: 5, currentStock: 2, vendorEmail: "supply@caterpro.com" },
  { id: "r8", name: "Plastic Cups – Clear 12oz (500)", category: "Catering Equipment", vendor: "ElegantDine", unitPrice: 30.00, minStock: 4, currentStock: 0, vendorEmail: "orders@elegantdine.com" },
  { id: "r9", name: "Serving Trays – Silver (10 pk)", category: "Catering Equipment", vendor: "CaterPro", unitPrice: 75.00, minStock: 3, currentStock: 3, vendorEmail: "supply@caterpro.com" },
  { id: "r10", name: "Fog Machine Fluid (4 gallons)", category: "AV & Entertainment", vendor: "ChauvetDJ", unitPrice: 48.00, minStock: 3, currentStock: 1, vendorEmail: "parts@chauvetdj.com" },
  { id: "r11", name: "Photo Booth Props Refill Kit", category: "AV & Entertainment", vendor: "SnapFun", unitPrice: 32.00, minStock: 5, currentStock: 2, vendorEmail: "hello@snapfun.com" },
  { id: "r12", name: "Wireless Mic Batteries (AA 48pk)", category: "AV & Entertainment", vendor: "Shure", unitPrice: 25.00, minStock: 4, currentStock: 1, vendorEmail: "accessories@shure.com" },
];
