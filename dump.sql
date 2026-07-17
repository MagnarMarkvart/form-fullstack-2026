-- Sector Registration demo database: schema and data
-- This file can be restored directly with sqlite3 app.db < dump.sql.
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
DROP TABLE IF EXISTS user_sectors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sectors;

CREATE TABLE sectors (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  parentId TEXT
);

CREATE TABLE users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  agreeToTerms INTEGER NOT NULL CHECK (agreeToTerms IN (0, 1)),
  createdAt    TEXT NOT NULL
);

CREATE TABLE user_sectors (
  userId   TEXT NOT NULL,
  sectorId TEXT NOT NULL,
  PRIMARY KEY (userId, sectorId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sectorId) REFERENCES sectors(id)
);

-- Canonical sector options from the supplied select element
INSERT INTO sectors (id, name, parentId) VALUES ('1', 'Manufacturing', NULL);
INSERT INTO sectors (id, name, parentId) VALUES ('19', 'Construction materials', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('18', 'Electronics and Optics', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('6', 'Food and Beverage', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('342', 'Bakery & confectionery products', '6');
INSERT INTO sectors (id, name, parentId) VALUES ('43', 'Beverages', '6');
INSERT INTO sectors (id, name, parentId) VALUES ('42', 'Fish & fish products', '6');
INSERT INTO sectors (id, name, parentId) VALUES ('40', 'Meat & meat products', '6');
INSERT INTO sectors (id, name, parentId) VALUES ('39', 'Milk & dairy products', '6');
INSERT INTO sectors (id, name, parentId) VALUES ('437', 'Other', '6');
INSERT INTO sectors (id, name, parentId) VALUES ('378', 'Sweets & snack food', '6');
INSERT INTO sectors (id, name, parentId) VALUES ('13', 'Furniture', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('389', 'Bathroom/sauna', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('385', 'Bedroom', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('390', 'Children’s room', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('98', 'Kitchen', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('101', 'Living room', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('392', 'Office', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('394', 'Other (Furniture)', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('341', 'Outdoor', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('99', 'Project furniture', '13');
INSERT INTO sectors (id, name, parentId) VALUES ('12', 'Machinery', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('94', 'Machinery components', '12');
INSERT INTO sectors (id, name, parentId) VALUES ('91', 'Machinery equipment/tools', '12');
INSERT INTO sectors (id, name, parentId) VALUES ('224', 'Manufacture of machinery', '12');
INSERT INTO sectors (id, name, parentId) VALUES ('97', 'Maritime', '12');
INSERT INTO sectors (id, name, parentId) VALUES ('271', 'Aluminium and steel workboats', '97');
INSERT INTO sectors (id, name, parentId) VALUES ('269', 'Boat/Yacht building', '97');
INSERT INTO sectors (id, name, parentId) VALUES ('230', 'Ship repair and conversion', '97');
INSERT INTO sectors (id, name, parentId) VALUES ('93', 'Metal structures', '12');
INSERT INTO sectors (id, name, parentId) VALUES ('508', 'Other', '12');
INSERT INTO sectors (id, name, parentId) VALUES ('227', 'Repair and maintenance service', '12');
INSERT INTO sectors (id, name, parentId) VALUES ('11', 'Metalworking', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('67', 'Construction of metal structures', '11');
INSERT INTO sectors (id, name, parentId) VALUES ('263', 'Houses and buildings', '11');
INSERT INTO sectors (id, name, parentId) VALUES ('267', 'Metal products', '11');
INSERT INTO sectors (id, name, parentId) VALUES ('542', 'Metal works', '11');
INSERT INTO sectors (id, name, parentId) VALUES ('75', 'CNC-machining', '542');
INSERT INTO sectors (id, name, parentId) VALUES ('62', 'Forgings, Fasteners', '542');
INSERT INTO sectors (id, name, parentId) VALUES ('69', 'Gas, Plasma, Laser cutting', '542');
INSERT INTO sectors (id, name, parentId) VALUES ('66', 'MIG, TIG, Aluminum welding', '542');
INSERT INTO sectors (id, name, parentId) VALUES ('9', 'Plastic and Rubber', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('54', 'Packaging', '9');
INSERT INTO sectors (id, name, parentId) VALUES ('556', 'Plastic goods', '9');
INSERT INTO sectors (id, name, parentId) VALUES ('559', 'Plastic processing technology', '9');
INSERT INTO sectors (id, name, parentId) VALUES ('55', 'Blowing', '559');
INSERT INTO sectors (id, name, parentId) VALUES ('57', 'Moulding', '559');
INSERT INTO sectors (id, name, parentId) VALUES ('53', 'Plastics welding and processing', '559');
INSERT INTO sectors (id, name, parentId) VALUES ('560', 'Plastic profiles', '9');
INSERT INTO sectors (id, name, parentId) VALUES ('5', 'Printing', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('148', 'Advertising', '5');
INSERT INTO sectors (id, name, parentId) VALUES ('150', 'Book/Periodicals printing', '5');
INSERT INTO sectors (id, name, parentId) VALUES ('145', 'Labelling and packaging printing', '5');
INSERT INTO sectors (id, name, parentId) VALUES ('7', 'Textile and Clothing', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('44', 'Clothing', '7');
INSERT INTO sectors (id, name, parentId) VALUES ('45', 'Textile', '7');
INSERT INTO sectors (id, name, parentId) VALUES ('8', 'Wood', '1');
INSERT INTO sectors (id, name, parentId) VALUES ('337', 'Other (Wood)', '8');
INSERT INTO sectors (id, name, parentId) VALUES ('51', 'Wooden building materials', '8');
INSERT INTO sectors (id, name, parentId) VALUES ('47', 'Wooden houses', '8');
INSERT INTO sectors (id, name, parentId) VALUES ('3', 'Other', NULL);
INSERT INTO sectors (id, name, parentId) VALUES ('37', 'Creative industries', '3');
INSERT INTO sectors (id, name, parentId) VALUES ('29', 'Energy technology', '3');
INSERT INTO sectors (id, name, parentId) VALUES ('33', 'Environment', '3');
INSERT INTO sectors (id, name, parentId) VALUES ('2', 'Service', NULL);
INSERT INTO sectors (id, name, parentId) VALUES ('25', 'Business services', '2');
INSERT INTO sectors (id, name, parentId) VALUES ('35', 'Engineering', '2');
INSERT INTO sectors (id, name, parentId) VALUES ('28', 'Information Technology and Telecommunications', '2');
INSERT INTO sectors (id, name, parentId) VALUES ('581', 'Data processing, Web portals, E-marketing', '28');
INSERT INTO sectors (id, name, parentId) VALUES ('576', 'Programming, Consultancy', '28');
INSERT INTO sectors (id, name, parentId) VALUES ('121', 'Software, Hardware', '28');
INSERT INTO sectors (id, name, parentId) VALUES ('122', 'Telecommunications', '28');
INSERT INTO sectors (id, name, parentId) VALUES ('22', 'Tourism', '2');
INSERT INTO sectors (id, name, parentId) VALUES ('141', 'Translation services', '2');
INSERT INTO sectors (id, name, parentId) VALUES ('21', 'Transport and Logistics', '2');
INSERT INTO sectors (id, name, parentId) VALUES ('111', 'Air', '21');
INSERT INTO sectors (id, name, parentId) VALUES ('114', 'Rail', '21');
INSERT INTO sectors (id, name, parentId) VALUES ('112', 'Road', '21');
INSERT INTO sectors (id, name, parentId) VALUES ('113', 'Water', '21');

-- Demo registrations: one single-sector user and one multi-sector user
INSERT INTO users (id, name, agreeToTerms, createdAt) VALUES ('demo-single-sector', 'Ava Example', 1, '2026-01-01T00:00:00.000Z');
INSERT INTO user_sectors (userId, sectorId) VALUES ('demo-single-sector', '342');
INSERT INTO users (id, name, agreeToTerms, createdAt) VALUES ('demo-multiple-sectors', 'Noah Example', 1, '2026-01-02T00:00:00.000Z');
INSERT INTO user_sectors (userId, sectorId) VALUES ('demo-multiple-sectors', '269');
INSERT INTO user_sectors (userId, sectorId) VALUES ('demo-multiple-sectors', '342');
INSERT INTO user_sectors (userId, sectorId) VALUES ('demo-multiple-sectors', '581');
COMMIT;
PRAGMA foreign_keys = ON;
