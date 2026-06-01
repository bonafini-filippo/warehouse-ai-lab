CREATE TABLE IF NOT EXISTS operators (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'driver',
  status TEXT NOT NULL DEFAULT 'available',
  available_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incoming_goods (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INT NOT NULL,
  arrival_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'arrived',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO operators (name, role, status, available_date) VALUES
('Marco Bianchi', 'driver', 'available', CURRENT_DATE + INTERVAL '1 day'),
('Luca Rossi', 'driver', 'available', CURRENT_DATE + INTERVAL '1 day'),
('Giulia Verdi', 'warehouse_worker', 'busy', CURRENT_DATE + INTERVAL '1 day'),
('Antonio Neri', 'driver', 'available', CURRENT_DATE),
('Sara Ferrari', 'driver', 'off', CURRENT_DATE + INTERVAL '1 day');

INSERT INTO orders (code, customer_name, destination, status, shipping_date) VALUES
('ORD-001', 'Cliente Alfa', 'Milano', 'pending', CURRENT_DATE),
('ORD-002', 'Cliente Beta', 'Roma', 'ready', CURRENT_DATE),
('ORD-003', 'Cliente Gamma', 'Torino', 'pending', CURRENT_DATE + INTERVAL '1 day');

INSERT INTO incoming_goods (code, supplier_name, item_name, quantity, arrival_date, status) VALUES
('IN-001', 'Fornitore Nord', 'Bancale ricambi', 12, CURRENT_DATE, 'arrived'),
('IN-002', 'Fornitore Sud', 'Scatole imballaggio', 50, CURRENT_DATE, 'checked');
