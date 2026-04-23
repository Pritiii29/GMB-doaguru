const db = require("../config/db");

const defaultPlans = [
  {
    name: "Starter",
    description: "Perfect for new businesses",
    price: 0,
    durationDays: 30,
    maxReviewsPerMonth: 100,
    features: ["Unlimited QR Codes", "Basic Analytics", "Email Support"],
  },
  {
    name: "Professional",
    description: "For growing businesses",
    price: 4999,
    durationDays: 30,
    maxReviewsPerMonth: 1000,
    features: ["Unlimited QR Codes", "Advanced Analytics", "Priority Support", "Custom Branding"],
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: 9999,
    durationDays: 30,
    maxReviewsPerMonth: null,
    features: [
      "Unlimited QR Codes",
      "Advanced Analytics",
      "24/7 Support",
      "Custom Branding",
      "API Access",
      "Dedicated Account Manager",
    ],
  },
];

let schemaPromise;

const ensureColumns = async (connection, tableName, columns) => {
  const [existingColumns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
  const existingColumnNames = new Set(existingColumns.map((column) => column.Field));

  for (const column of columns) {
    if (!existingColumnNames.has(column.name)) {
      await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${column.definition}`);
    }
  }
};

const tableExists = async (connection, tableName) => {
  const [rows] = await connection.query(
    `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
    `,
    [tableName]
  );

  return rows.length > 0;
};

const getColumnNames = async (connection, tableName) => {
  const [columns] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
  return new Set(columns.map((column) => column.Field));
};

const dropForeignKeyIfExists = async (connection, tableName, constraintName) => {
  const [constraints] = await connection.query(
    `
      SELECT CONSTRAINT_NAME
      FROM information_schema.REFERENTIAL_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
    `,
    [tableName, constraintName]
  );

  if (constraints.length > 0) {
    await connection.query(`ALTER TABLE ${tableName} DROP FOREIGN KEY ${constraintName}`);
  }
};

const ensureSubscriptionSchema = async () => {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    const connection = db.promise();

    if (await tableExists(connection, "subscription_plans")) {
      const planColumns = await getColumnNames(connection, "subscription_plans");
      const looksLikeLegacyClientPeriodTable = planColumns.has("clientId") && planColumns.has("started_date");

      if (looksLikeLegacyClientPeriodTable) {
        await dropForeignKeyIfExists(connection, "subscriptions", "subscriptions_plan_fk");

        let backupTable = "subscription_plans_legacy";
        if (await tableExists(connection, backupTable)) {
          backupTable = `subscription_plans_legacy_${Date.now()}`;
        }

        await connection.query(`RENAME TABLE subscription_plans TO ${backupTable}`);
      }
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name varchar(100) NOT NULL,
        description text,
        price decimal(10, 2) NOT NULL,
        currency varchar(5) DEFAULT 'INR',
        duration_days int(11) DEFAULT 30,
        max_reviews_per_month int(11) DEFAULT NULL,
        features json,
        is_active tinyint(1) DEFAULT 1,
        createdAt timestamp DEFAULT current_timestamp(),
        updatedAt timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        UNIQUE KEY unique_plan_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    await ensureColumns(connection, "subscription_plans", [
      { name: "name", definition: "name varchar(100) NULL" },
      { name: "description", definition: "description text" },
      { name: "price", definition: "price decimal(10, 2) NOT NULL DEFAULT 0" },
      { name: "currency", definition: "currency varchar(5) DEFAULT 'INR'" },
      { name: "duration_days", definition: "duration_days int(11) DEFAULT 30" },
      { name: "max_reviews_per_month", definition: "max_reviews_per_month int(11) DEFAULT NULL" },
      { name: "features", definition: "features json" },
      { name: "is_active", definition: "is_active tinyint(1) DEFAULT 1" },
      { name: "updatedAt", definition: "updatedAt timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp()" },
    ]);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        clientId varchar(50) NOT NULL,
        planId int(11) NOT NULL,
        status enum('active', 'inactive', 'expired', 'cancelled') DEFAULT 'active',
        start_date datetime NOT NULL DEFAULT current_timestamp(),
        end_date datetime NOT NULL,
        renewal_date datetime,
        auto_renew tinyint(1) DEFAULT 1,
        amount_paid decimal(10, 2),
        payment_method varchar(50),
        transaction_id varchar(100),
        notes text,
        createdAt timestamp DEFAULT current_timestamp(),
        updatedAt timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        KEY idx_subscriptions_client_status (clientId, status),
        KEY idx_subscriptions_plan (planId),
        CONSTRAINT subscriptions_client_fk FOREIGN KEY (clientId) REFERENCES clients(clientId),
        CONSTRAINT subscriptions_plan_fk FOREIGN KEY (planId) REFERENCES subscription_plans(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscription_history (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        clientId varchar(50) NOT NULL,
        subscriptionId int(11),
        action enum('created', 'renewed', 'upgraded', 'downgraded', 'cancelled', 'expired') NOT NULL,
        old_planId int(11),
        new_planId int(11),
        notes text,
        createdAt timestamp DEFAULT current_timestamp(),
        KEY idx_subscription_history_client (clientId),
        KEY idx_subscription_history_subscription (subscriptionId),
        CONSTRAINT subscription_history_client_fk FOREIGN KEY (clientId) REFERENCES clients(clientId),
        CONSTRAINT subscription_history_subscription_fk FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        clientId varchar(50),
        type varchar(50) NOT NULL,
        message text NOT NULL,
        is_read tinyint(1) DEFAULT 0,
        createdAt timestamp DEFAULT current_timestamp(),
        CONSTRAINT notifications_client_fk FOREIGN KEY (clientId) REFERENCES clients(clientId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    for (const plan of defaultPlans) {
      await connection.query(
        `
          INSERT INTO subscription_plans
            (name, description, price, duration_days, max_reviews_per_month, features, is_active)
          SELECT ?, ?, ?, ?, ?, ?, 1
          WHERE NOT EXISTS (
            SELECT 1 FROM subscription_plans WHERE name = ?
          )
        `,
        [
          plan.name,
          plan.description,
          plan.price,
          plan.durationDays,
          plan.maxReviewsPerMonth,
          JSON.stringify(plan.features),
          plan.name,
        ]
      );
    }
  })().catch((error) => {
    schemaPromise = undefined;
    throw error;
  });

  return schemaPromise;
};

module.exports = ensureSubscriptionSchema;
