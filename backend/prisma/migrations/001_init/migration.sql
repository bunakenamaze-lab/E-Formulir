-- CreateTable: users
CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'OPERATOR') NOT NULL DEFAULT 'OPERATOR',
  `avatar` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `lastLogin` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_email_key`(`email`),
  INDEX `users_email_idx`(`email`),
  INDEX `users_role_idx`(`role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: forms
CREATE TABLE `forms` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `settings` JSON NOT NULL,
  `theme` JSON NULL,
  `viewCount` INTEGER NOT NULL DEFAULT 0,
  `isTemplate` BOOLEAN NOT NULL DEFAULT false,
  `category` VARCHAR(191) NULL,
  `tags` TEXT NULL,
  `createdById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `publishedAt` DATETIME(3) NULL,
  `closedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `forms_slug_key`(`slug`),
  INDEX `forms_slug_idx`(`slug`),
  INDEX `forms_status_idx`(`status`),
  INDEX `forms_createdById_idx`(`createdById`),
  INDEX `forms_isTemplate_idx`(`isTemplate`),
  CONSTRAINT `forms_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: fields
CREATE TABLE `fields` (
  `id` VARCHAR(191) NOT NULL,
  `formId` VARCHAR(191) NOT NULL,
  `type` ENUM('TEXT','TEXTAREA','NUMBER','EMAIL','PHONE','DATE','TIME','DROPDOWN','RADIO','CHECKBOX','MULTIPLE_CHOICE','FILE_UPLOAD','IMAGE_UPLOAD','SIGNATURE','LOCATION','RATING','MATRIX','SECTION_DIVIDER','HEADING','DESCRIPTION') NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `placeholder` VARCHAR(191) NULL,
  `helpText` TEXT NULL,
  `config` JSON NOT NULL,
  `conditional` JSON NULL,
  `order` INTEGER NOT NULL,
  `section` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fields_formId_idx`(`formId`),
  INDEX `fields_order_idx`(`order`),
  CONSTRAINT `fields_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: responses
CREATE TABLE `responses` (
  `id` VARCHAR(191) NOT NULL,
  `formId` VARCHAR(191) NOT NULL,
  `respondentEmail` VARCHAR(191) NULL,
  `respondentName` VARCHAR(191) NULL,
  `userId` VARCHAR(191) NULL,
  `isCompleted` BOOLEAN NOT NULL DEFAULT false,
  `isDraft` BOOLEAN NOT NULL DEFAULT false,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` TEXT NULL,
  `location` JSON NULL,
  `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3) NULL,
  `timeSpent` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `responses_formId_idx`(`formId`),
  INDEX `responses_userId_idx`(`userId`),
  INDEX `responses_isCompleted_idx`(`isCompleted`),
  INDEX `responses_createdAt_idx`(`createdAt`),
  CONSTRAINT `responses_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `responses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: answers
CREATE TABLE `answers` (
  `id` VARCHAR(191) NOT NULL,
  `responseId` VARCHAR(191) NOT NULL,
  `fieldId` VARCHAR(191) NOT NULL,
  `value` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `answers_responseId_idx`(`responseId`),
  INDEX `answers_fieldId_idx`(`fieldId`),
  CONSTRAINT `answers_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `responses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `answers_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: audit_logs
CREATE TABLE `audit_logs` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `action` ENUM('LOGIN','LOGOUT','CREATE_FORM','UPDATE_FORM','DELETE_FORM','PUBLISH_FORM','CREATE_RESPONSE','UPDATE_RESPONSE','DELETE_RESPONSE','CREATE_USER','UPDATE_USER','DELETE_USER','EXPORT_DATA') NOT NULL,
  `entity` VARCHAR(191) NOT NULL,
  `entityId` VARCHAR(191) NULL,
  `details` JSON NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `audit_logs_userId_idx`(`userId`),
  INDEX `audit_logs_action_idx`(`action`),
  INDEX `audit_logs_createdAt_idx`(`createdAt`),
  CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: notifications
CREATE TABLE `notifications` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `readAt` DATETIME(3) NULL,
  `link` VARCHAR(191) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `notifications_userId_idx`(`userId`),
  INDEX `notifications_isRead_idx`(`isRead`),
  INDEX `notifications_createdAt_idx`(`createdAt`),
  CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: settings
CREATE TABLE `settings` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `settings_key_key`(`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
