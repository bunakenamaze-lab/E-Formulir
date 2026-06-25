import { PrismaClient, UserRole, FormStatus, FieldType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const operatorPassword = await bcrypt.hash('Operator123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@pcnubandung.or.id' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'superadmin@pcnubandung.or.id',
      password: hashedPassword,
      name: 'Super Administrator',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pcnubandung.or.id' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@pcnubandung.or.id',
      password: adminPassword,
      name: 'Admin PCNU',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@pcnubandung.or.id' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'operator@pcnubandung.or.id',
      password: operatorPassword,
      name: 'Operator PCNU',
      role: UserRole.OPERATOR,
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // Create system settings
  await prisma.setting.upsert({
    where: { key: 'organization' },
    update: {},
    create: {
      key: 'organization',
      value: {
        name: 'Pengurus Cabang Nahdlatul Ulama Kota Bandung',
        shortName: 'PCNU Kota Bandung',
        email: 'info@pcnubandung.or.id',
        phone: '(022) 000-0000',
        address: 'Jl. Contoh No. 1, Kota Bandung, Jawa Barat',
        website: 'https://pcnubandung.or.id',
        logo: null,
      },
    },
  });

  await prisma.setting.upsert({
    where: { key: 'app' },
    update: {},
    create: {
      key: 'app',
      value: {
        appName: 'Sistem Formulir Digital PCNU Kota Bandung',
        appVersion: '1.0.0',
        maintenanceMode: false,
        allowRegistration: false,
        defaultRole: 'OPERATOR',
      },
    },
  });

  console.log('✅ Settings created');

  // Create template forms
  // Template 1: Pendaftaran Anggota NU
  const pendaftaranAnggota = await prisma.form.create({
    data: {
      id: uuidv4(),
      title: 'Pendaftaran Anggota Nahdlatul Ulama',
      description: 'Formulir pendaftaran anggota baru Nahdlatul Ulama Kota Bandung',
      slug: 'template-pendaftaran-anggota',
      status: FormStatus.PUBLISHED,
      isTemplate: true,
      category: 'Keanggotaan',
      tags: 'anggota,pendaftaran,nu',
      createdById: superAdmin.id,
      settings: {
        allowMultiple: false,
        showProgress: true,
        requireAuth: false,
        autoSave: true,
        submitMessage: 'Terima kasih! Pendaftaran Anda telah diterima. Kami akan menghubungi Anda segera.',
        multiStep: true,
      },
      theme: {
        primaryColor: '#0F7A3D',
        backgroundColor: '#F5F7FA',
        fontFamily: 'Inter',
      },
      publishedAt: new Date(),
    },
  });

  // Fields for Pendaftaran Anggota
  const fieldsPendaftaran = [
    { order: 1, type: FieldType.HEADING, label: 'Data Diri', config: { size: 'h2' } },
    { order: 2, type: FieldType.TEXT, label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap Anda', config: { required: true, minLength: 3, maxLength: 100 } },
    { order: 3, type: FieldType.TEXT, label: 'Nama Panggilan', placeholder: 'Masukkan nama panggilan', config: { required: false } },
    { order: 4, type: FieldType.RADIO, label: 'Jenis Kelamin', config: { required: true, options: ['Laki-laki', 'Perempuan'] } },
    { order: 5, type: FieldType.DATE, label: 'Tanggal Lahir', config: { required: true } },
    { order: 6, type: FieldType.TEXT, label: 'Tempat Lahir', placeholder: 'Masukkan tempat lahir', config: { required: true } },
    { order: 7, type: FieldType.TEXT, label: 'NIK (Nomor Induk Kependudukan)', placeholder: 'Masukkan 16 digit NIK', config: { required: true, minLength: 16, maxLength: 16, pattern: '^[0-9]{16}$' } },
    { order: 8, type: FieldType.SECTION_DIVIDER, label: '', config: {} },
    { order: 9, type: FieldType.HEADING, label: 'Kontak & Alamat', config: { size: 'h2' } },
    { order: 10, type: FieldType.PHONE, label: 'Nomor Telepon/HP', placeholder: 'Contoh: 08123456789', config: { required: true } },
    { order: 11, type: FieldType.EMAIL, label: 'Alamat Email', placeholder: 'Contoh: nama@email.com', config: { required: false } },
    { order: 12, type: FieldType.TEXTAREA, label: 'Alamat Lengkap', placeholder: 'Masukkan alamat lengkap', config: { required: true, rows: 3 } },
    { order: 13, type: FieldType.TEXT, label: 'RT/RW', placeholder: 'Contoh: 001/002', config: { required: true } },
    { order: 14, type: FieldType.TEXT, label: 'Kelurahan/Desa', placeholder: 'Masukkan nama kelurahan/desa', config: { required: true } },
    { order: 15, type: FieldType.TEXT, label: 'Kecamatan', placeholder: 'Masukkan nama kecamatan', config: { required: true } },
    { order: 16, type: FieldType.SECTION_DIVIDER, label: '', config: {} },
    { order: 17, type: FieldType.HEADING, label: 'Pendidikan & Pekerjaan', config: { size: 'h2' } },
    { order: 18, type: FieldType.DROPDOWN, label: 'Pendidikan Terakhir', config: { required: true, options: ['SD/MI', 'SMP/MTs', 'SMA/SMK/MA', 'D1/D2/D3', 'S1/D4', 'S2', 'S3'] } },
    { order: 19, type: FieldType.TEXT, label: 'Pekerjaan', placeholder: 'Masukkan pekerjaan Anda', config: { required: false } },
    { order: 20, type: FieldType.SECTION_DIVIDER, label: '', config: {} },
    { order: 21, type: FieldType.HEADING, label: 'Informasi NU', config: { size: 'h2' } },
    { order: 22, type: FieldType.TEXT, label: 'Ranting/MWC asal', placeholder: 'Masukkan nama Ranting/MWC', config: { required: false } },
    { order: 23, type: FieldType.DROPDOWN, label: 'Lembaga/Badan Otonom yang Diikuti', config: { required: false, options: ['Tidak ada', 'GP Ansor', 'Fatayat NU', 'IPNU', 'IPPNU', 'Muslimat NU', 'PMII', 'Lesbumi', 'Lainnya'] } },
    { order: 24, type: FieldType.IMAGE_UPLOAD, label: 'Foto 3x4', config: { required: false, accept: 'image/*', maxSize: 2097152 } },
  ];

  for (const field of fieldsPendaftaran) {
    await prisma.field.create({
      data: {
        id: uuidv4(),
        formId: pendaftaranAnggota.id,
        type: field.type,
        label: field.label,
        placeholder: (field as any).placeholder,
        config: field.config,
        order: field.order,
      },
    });
  }

  console.log('✅ Template Pendaftaran Anggota created');

  // Template 2: Registrasi Kegiatan
  const registrasiKegiatan = await prisma.form.create({
    data: {
      id: uuidv4(),
      title: 'Registrasi Kegiatan PCNU Kota Bandung',
      description: 'Formulir pendaftaran kegiatan dan acara yang diselenggarakan PCNU Kota Bandung',
      slug: 'template-registrasi-kegiatan',
      status: FormStatus.PUBLISHED,
      isTemplate: true,
      category: 'Kegiatan',
      tags: 'kegiatan,registrasi,acara',
      createdById: superAdmin.id,
      settings: {
        allowMultiple: false,
        showProgress: true,
        requireAuth: false,
        autoSave: true,
        submitMessage: 'Pendaftaran berhasil! Konfirmasi akan dikirimkan ke email Anda.',
        multiStep: false,
      },
      theme: {
        primaryColor: '#0F7A3D',
        backgroundColor: '#F5F7FA',
        fontFamily: 'Inter',
      },
      publishedAt: new Date(),
    },
  });

  const fieldsKegiatan = [
    { order: 1, type: FieldType.TEXT, label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap', config: { required: true } },
    { order: 2, type: FieldType.EMAIL, label: 'Email', placeholder: 'Masukkan email aktif', config: { required: true } },
    { order: 3, type: FieldType.PHONE, label: 'Nomor WhatsApp', placeholder: 'Contoh: 08123456789', config: { required: true } },
    { order: 4, type: FieldType.TEXT, label: 'Asal Instansi/Organisasi', placeholder: 'Contoh: Ranting NU Sukajadi', config: { required: false } },
    { order: 5, type: FieldType.DROPDOWN, label: 'Jenis Peserta', config: { required: true, options: ['Pengurus Cabang', 'Pengurus MWC', 'Pengurus Ranting', 'Badan Otonom', 'Umum'] } },
    { order: 6, type: FieldType.RADIO, label: 'Kebutuhan Transportasi', config: { required: true, options: ['Mandiri', 'Butuh Bantuan'] } },
    { order: 7, type: FieldType.RADIO, label: 'Kebutuhan Penginapan', config: { required: true, options: ['Tidak Perlu', 'Perlu'] } },
    { order: 8, type: FieldType.TEXTAREA, label: 'Catatan Tambahan', placeholder: 'Jika ada pertanyaan atau catatan khusus', config: { required: false, rows: 3 } },
  ];

  for (const field of fieldsKegiatan) {
    await prisma.field.create({
      data: {
        id: uuidv4(),
        formId: registrasiKegiatan.id,
        type: field.type,
        label: field.label,
        placeholder: (field as any).placeholder,
        config: field.config,
        order: field.order,
      },
    });
  }

  console.log('✅ Template Registrasi Kegiatan created');

  // Template 3: Survei Kepuasan
  const surveiKepuasan = await prisma.form.create({
    data: {
      id: uuidv4(),
      title: 'Survei Kepuasan Layanan PCNU Kota Bandung',
      description: 'Kami mengundang Anda untuk memberikan masukan dan penilaian terhadap layanan PCNU Kota Bandung',
      slug: 'template-survei-kepuasan',
      status: FormStatus.PUBLISHED,
      isTemplate: true,
      category: 'Survei',
      tags: 'survei,kepuasan,layanan',
      createdById: superAdmin.id,
      settings: {
        allowMultiple: true,
        showProgress: false,
        requireAuth: false,
        autoSave: false,
        submitMessage: 'Terima kasih atas masukan Anda! Penilaian Anda sangat berarti untuk perbaikan layanan kami.',
        multiStep: false,
      },
      theme: {
        primaryColor: '#0F7A3D',
        backgroundColor: '#F5F7FA',
        fontFamily: 'Inter',
      },
      publishedAt: new Date(),
    },
  });

  const fieldsSurvei = [
    { order: 1, type: FieldType.RATING, label: 'Bagaimana penilaian Anda secara keseluruhan terhadap layanan PCNU Kota Bandung?', config: { required: true, max: 5 } },
    { order: 2, type: FieldType.RATING, label: 'Bagaimana penilaian Anda terhadap kecepatan pelayanan?', config: { required: true, max: 5 } },
    { order: 3, type: FieldType.RATING, label: 'Bagaimana penilaian Anda terhadap keramahan petugas?', config: { required: true, max: 5 } },
    { order: 4, type: FieldType.RATING, label: 'Bagaimana penilaian Anda terhadap kelengkapan informasi yang diberikan?', config: { required: true, max: 5 } },
    { order: 5, type: FieldType.RADIO, label: 'Apakah Anda akan merekomendasikan layanan PCNU kepada orang lain?', config: { required: true, options: ['Ya, pasti', 'Mungkin', 'Tidak'] } },
    { order: 6, type: FieldType.CHECKBOX, label: 'Aspek apa yang perlu ditingkatkan? (Pilih semua yang sesuai)', config: { required: false, options: ['Kecepatan layanan', 'Keramahan petugas', 'Informasi yang diberikan', 'Fasilitas', 'Prosedur administrasi', 'Website dan media digital'] } },
    { order: 7, type: FieldType.TEXTAREA, label: 'Saran dan masukan Anda', placeholder: 'Tuliskan saran atau masukan Anda untuk perbaikan layanan kami', config: { required: false, rows: 4 } },
    { order: 8, type: FieldType.TEXT, label: 'Nama (Opsional)', placeholder: 'Nama Anda (boleh dikosongkan)', config: { required: false } },
  ];

  for (const field of fieldsSurvei) {
    await prisma.field.create({
      data: {
        id: uuidv4(),
        formId: surveiKepuasan.id,
        type: field.type,
        label: field.label,
        placeholder: (field as any).placeholder,
        config: field.config,
        order: field.order,
      },
    });
  }

  console.log('✅ Template Survei Kepuasan created');

  // Template 4: Pendataan Masjid
  const pendataanMasjid = await prisma.form.create({
    data: {
      id: uuidv4(),
      title: 'Pendataan Masjid / Musholla',
      description: 'Formulir pendataan masjid dan musholla di wilayah Kota Bandung',
      slug: 'template-pendataan-masjid',
      status: FormStatus.PUBLISHED,
      isTemplate: true,
      category: 'Pendataan',
      tags: 'masjid,musholla,pendataan',
      createdById: superAdmin.id,
      settings: {
        allowMultiple: false,
        showProgress: true,
        requireAuth: false,
        autoSave: true,
        submitMessage: 'Data masjid/musholla berhasil dikirim. Terima kasih atas partisipasi Anda.',
        multiStep: true,
      },
      theme: {
        primaryColor: '#0F7A3D',
        backgroundColor: '#F5F7FA',
        fontFamily: 'Inter',
      },
      publishedAt: new Date(),
    },
  });

  const fieldsMasjid = [
    { order: 1, type: FieldType.TEXT, label: 'Nama Masjid/Musholla', placeholder: 'Masukkan nama resmi masjid/musholla', config: { required: true } },
    { order: 2, type: FieldType.RADIO, label: 'Jenis', config: { required: true, options: ['Masjid', 'Musholla/Langgar'] } },
    { order: 3, type: FieldType.TEXTAREA, label: 'Alamat Lengkap', placeholder: 'Masukkan alamat lengkap', config: { required: true, rows: 3 } },
    { order: 4, type: FieldType.TEXT, label: 'Kelurahan', placeholder: 'Nama kelurahan', config: { required: true } },
    { order: 5, type: FieldType.TEXT, label: 'Kecamatan', placeholder: 'Nama kecamatan', config: { required: true } },
    { order: 6, type: FieldType.NUMBER, label: 'Kapasitas Jamaah', placeholder: 'Jumlah jamaah yang dapat ditampung', config: { required: true, min: 1 } },
    { order: 7, type: FieldType.TEXT, label: 'Nama Ketua DKM/Takmir', placeholder: 'Masukkan nama ketua DKM/Takmir', config: { required: true } },
    { order: 8, type: FieldType.PHONE, label: 'Nomor Kontak DKM/Takmir', placeholder: 'Nomor HP yang aktif', config: { required: true } },
    { order: 9, type: FieldType.CHECKBOX, label: 'Fasilitas yang Tersedia', config: { required: false, options: ['Sound System', 'AC/Kipas Angin', 'Perpustakaan Mini', 'Tempat Wudhu Memadai', 'Toilet', 'Parkir', 'WiFi', 'CCTV'] } },
    { order: 10, type: FieldType.CHECKBOX, label: 'Kegiatan Rutin', config: { required: false, options: ['Sholat 5 Waktu Berjamaah', 'Pengajian Rutin', 'Madrasah/TPQ', 'Majlis Taklim', 'Kegiatan Remaja Masjid'] } },
    { order: 11, type: FieldType.IMAGE_UPLOAD, label: 'Foto Masjid/Musholla', config: { required: false, accept: 'image/*', maxSize: 5242880 } },
  ];

  for (const field of fieldsMasjid) {
    await prisma.field.create({
      data: {
        id: uuidv4(),
        formId: pendataanMasjid.id,
        type: field.type,
        label: field.label,
        placeholder: (field as any).placeholder,
        config: field.config,
        order: field.order,
      },
    });
  }

  console.log('✅ Template Pendataan Masjid created');

  // Create demo responses
  const demoResponse1 = await prisma.response.create({
    data: {
      id: uuidv4(),
      formId: pendaftaranAnggota.id,
      respondentName: 'Ahmad Fauzan',
      respondentEmail: 'ahmad.fauzan@example.com',
      isCompleted: true,
      isDraft: false,
      ipAddress: '127.0.0.1',
      completedAt: new Date(),
      timeSpent: 420,
    },
  });

  const demoResponse2 = await prisma.response.create({
    data: {
      id: uuidv4(),
      formId: pendaftaranAnggota.id,
      respondentName: 'Siti Nurhaliza',
      respondentEmail: 'siti.nur@example.com',
      isCompleted: true,
      isDraft: false,
      ipAddress: '127.0.0.1',
      completedAt: new Date(),
      timeSpent: 380,
    },
  });

  const demoResponse3 = await prisma.response.create({
    data: {
      id: uuidv4(),
      formId: surveiKepuasan.id,
      respondentName: 'Hasan Basri',
      isCompleted: true,
      isDraft: false,
      ipAddress: '127.0.0.1',
      completedAt: new Date(),
      timeSpent: 120,
    },
  });

  console.log('✅ Demo responses created');

  // Create notifications
  await prisma.notification.create({
    data: {
      id: uuidv4(),
      userId: superAdmin.id,
      title: 'Selamat Datang!',
      message: 'Selamat datang di Sistem Formulir Digital PCNU Kota Bandung. Mulai buat formulir pertama Anda!',
      type: 'info',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      id: uuidv4(),
      userId: admin.id,
      title: 'Respon Baru Diterima',
      message: 'Ada 3 respon baru untuk formulir Pendaftaran Anggota NU.',
      type: 'success',
      isRead: false,
      link: `/forms/${pendaftaranAnggota.id}/responses`,
    },
  });

  console.log('✅ Notifications created');

  // Audit logs
  await prisma.auditLog.create({
    data: {
      id: uuidv4(),
      userId: superAdmin.id,
      action: 'CREATE_FORM',
      entity: 'Form',
      entityId: pendaftaranAnggota.id,
      details: { formTitle: 'Pendaftaran Anggota Nahdlatul Ulama' },
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ Audit logs created');
  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('   Super Admin: superadmin@pcnubandung.or.id / SuperAdmin123!');
  console.log('   Admin:       admin@pcnubandung.or.id / Admin123!');
  console.log('   Operator:    operator@pcnubandung.or.id / Operator123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
