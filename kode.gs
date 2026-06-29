var SPREADSHEET_ID = "MASUKKAN_ID_SPREADSHEET_DISINI"; // Ganti dengan ID Spreadsheet Anda

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Klinik Ceri Fisio')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Fungsi Helper untuk mengambil data dari sheet menjadi Array of Objects
function getSheetData(sheetName) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return []; // Jika sheet belum dibuat
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    var headers = data[0];
    var result = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j] !== "" ? row[j] : null;
      }
      result.push(obj);
    }
    return result;
  } catch(e) {
    return { error: e.toString() };
  }
}

// Mengambil seluruh database saat inisialisasi aplikasi
function getAllData() {
  return {
    users: getSheetData('users'),
    patients: getSheetData('patients'),
    therapists: getSheetData('therapists'),
    therapies: getSheetData('therapies'),
    registrations: getSheetData('registrations'),
    schedules: getSheetData('schedules'),
    medicalRecords: getSheetData('medicalRecords')
  };
}

// Fungsi umum untuk Insert atau Update record
function saveRecord(sheetName, recordData, idField) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      // Auto-create sheet with headers if doesn't exist
      sheet = ss.insertSheet(sheetName);
      var headers = Object.keys(recordData);
      sheet.appendRow(headers);
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rowIndex = -1;
    
    // Cari baris jika update
    if (recordData[idField]) {
      var idIndex = headers.indexOf(idField);
      for (var i = 1; i < data.length; i++) {
        if (data[i][idIndex] === recordData[idField]) {
          rowIndex = i + 1;
          break;
        }
      }
    }
    
    var rowData = [];
    for (var j = 0; j < headers.length; j++) {
      rowData.push(recordData[headers[j]] || "");
    }
    
    if (rowIndex > -1) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, action: 'updated', id: recordData[idField] };
    } else {
      sheet.appendRow(rowData);
      return { success: true, action: 'inserted' };
    }
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// Fungsi delete record
function deleteRecordGS(sheetName, idField, idValue) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet tidak ditemukan");
    
    var data = sheet.getDataRange().getValues();
    var idIndex = data[0].indexOf(idField);
    
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][idIndex] === idValue) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "Berhasil dihapus" };
      }
    }
    return { success: false, message: "ID tidak ditemukan" };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

// Fungsi untuk Full Sync Database dari Client
function syncAllData(appData) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheets = ['users', 'patients', 'therapists', 'therapies', 'registrations', 'schedules', 'medicalRecords'];
    
    sheets.forEach(function(sName) {
      var sheet = ss.getSheetByName(sName);
      if (!sheet) {
        sheet = ss.insertSheet(sName);
      }
      
      var data = appData[sName];
      if (data && data.length > 0) {
        sheet.clear();
        var headers = Object.keys(data[0]);
        var rows = [headers];
        
        data.forEach(function(rowObj) {
          var row = [];
          headers.forEach(function(h) {
            row.push(rowObj[h] || '');
          });
          rows.push(row);
        });
        
        sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
      }
    });
    return { success: true };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

// Fungsi untuk membuat 20 data dummy di Spreadsheet
function seedDatabase() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. Data Users
    var usersData = [
      { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator', therapistId: '', patientId: '' },
      { username: 'fisio1', password: 'fisio123', role: 'therapist', name: 'Elisa Febi Anjani, S.Fis', therapistId: 'T-001', patientId: '' },
      { username: 'fisio2', password: 'fisio123', role: 'therapist', name: 'Rian Hartono, A.Md.Fis', therapistId: 'T-002', patientId: '' },
      { username: 'pasien1', password: 'pasien1123', role: 'patient', name: 'Budi Santoso', therapistId: '', patientId: 'RM-001' },
      { username: 'pasien2', password: 'pasien1123', role: 'patient', name: 'Siti Aminah', therapistId: '', patientId: 'RM-002' }
    ];
    
    // 2. Data Therapists
    var therapistsData = [
      { id: 'T-001', name: 'Elisa Febi Anjani S.Fis, Ftr, M.Si, PhD', specialization: 'Musculoskeletal & Sport Rehab', contact: '0812-3456-7890', bio: 'Fisioterapis utama dengan minat riset pemulihan gerak anatomis.' },
      { id: 'T-002', name: 'Rian Hartono, A.Md.Fis', specialization: 'Neuromuscular Rehab', contact: '0812-1111-2222', bio: 'Spesialis penanganan stroke, Parkinson, dan neuromuskular.' }
    ];

    // 3. Data Therapies
    var therapiesData = [
      { id: 'TY-001', name: 'Terapi Manual (Manual Therapy)', duration: '45 Menit', price: 150000, description: 'Mobilisasi persendian, manipulasi jaringan lunak, peregangan terapeutik pasif.' },
      { id: 'TY-002', name: 'Elektroterapi (Electrotherapy)', duration: '30 Menit', price: 100000, description: 'Tindakan US (Ultrasonic) dan TENS untuk memblokir impuls nyeri otot.' },
      { id: 'TY-003', name: 'Terapi Latihan (Exercise)', duration: '60 Menit', price: 180000, description: 'Latihan penguatan otot core, peningkatan ROM, koreksi postur biomekanik.' },
      { id: 'TY-004', name: 'Dry Needling', duration: '40 Menit', price: 200000, description: 'Penjaruman kering myofascial trigger point untuk membebaskan simpul nyeri.' }
    ];

    // 4. Data Patients (20 Patients)
    var patientsData = [
      { id: 'RM-001', name: 'Budi Santoso', birthDate: '1990-04-12', gender: 'Laki-laki', phone: '081234567890', address: 'Dusun Kembon, Kajen', history: 'Cedera Lutut ACL (Olahraga)', status: 'Aktif' },
      { id: 'RM-002', name: 'Siti Aminah', birthDate: '1985-08-22', gender: 'Perempuan', phone: '081298765432', address: 'Desa Pekiringan Alit, Kajen', history: 'Low Back Pain (Nyeri Punggung Bawah)', status: 'Aktif' },
      { id: 'RM-003', name: 'Ahmad Fauzi', birthDate: '1995-12-05', gender: 'Laki-laki', phone: '085712345678', address: 'Rowolaku, Kajen', history: 'Frozen Shoulder (Bahu Kaku)', status: 'Aktif' },
      { id: 'RM-004', name: 'Lani Wijaya', birthDate: '2000-01-15', gender: 'Perempuan', phone: '087755556666', address: 'Kajen Kulon', history: 'Pasca Pemulihan Stroke Ringan', status: 'Nonaktif' },
      { id: 'RM-005', name: 'Hendra Wijaya', birthDate: '1988-06-18', gender: 'Laki-laki', phone: '081277778888', address: 'Jl. Bahagia No. 12, Kajen', history: 'Nyeri Leher (Cervical Syndrome)', status: 'Aktif' },
      { id: 'RM-006', name: 'Dewi Lestari', birthDate: '1993-09-02', gender: 'Perempuan', phone: '085811112222', address: 'Pekiringan, Kajen', history: 'Keseleo Pergelangan Kaki (Ankle Sprain)', status: 'Aktif' },
      { id: 'RM-007', name: 'Rian Hidayat', birthDate: '1979-11-25', gender: 'Laki-laki', phone: '089933334444', address: 'Desa Kembon, Kajen', history: 'Hernia Nucleus Pulposus (HNP)', status: 'Aktif' },
      { id: 'RM-008', name: 'Farida Utami', birthDate: '1982-03-30', gender: 'Perempuan', phone: '081344445555', address: 'Noyontaan, Pekalongan', history: 'Tennis Elbow', status: 'Aktif' },
      { id: 'RM-009', name: 'Eko Prasetyo', birthDate: '1991-07-14', gender: 'Laki-laki', phone: '087855559999', address: 'Rowolaku, Kajen', history: 'Pasca Operasi Fraktur Femur', status: 'Aktif' },
      { id: 'RM-010', name: 'Rina Kartika', birthDate: '1997-10-22', gender: 'Perempuan', phone: '085699998888', address: 'Kajen Lor', history: 'Nyeri Sendi Lutut (Osteoarthritis)', status: 'Aktif' },
      { id: 'RM-011', name: 'Aris Setiawan', birthDate: '1986-02-15', gender: 'Laki-laki', phone: '082144449999', address: 'Tanjung, Kajen', history: 'Nyeri Tumit (Plantar Fasciitis)', status: 'Aktif' },
      { id: 'RM-012', name: 'Mega Wati', birthDate: '1994-05-09', gender: 'Perempuan', phone: '081233337777', address: 'Jl. Rinjani, Kajen', history: 'Skoliosis Ringan', status: 'Aktif' },
      { id: 'RM-013', name: 'Dodi Saputra', birthDate: '1980-08-11', gender: 'Laki-laki', phone: '085733334444', address: 'Pekalongan Barat', history: 'Kaku Leher (Stiff Neck)', status: 'Aktif' },
      { id: 'RM-014', name: 'Santi Novita', birthDate: '1989-12-01', gender: 'Perempuan', phone: '081266667777', address: 'Desa Pekiringan Alit', history: 'Spasme Otot Punggung Atas', status: 'Aktif' },
      { id: 'RM-015', name: 'Taufik Hidayat', birthDate: '1992-01-20', gender: 'Laki-laki', phone: '089922221111', address: 'Kajen Wetan', history: 'Cedera Hamstring', status: 'Aktif' },
      { id: 'RM-016', name: 'Indah Permata', birthDate: '1987-04-05', gender: 'Perempuan', phone: '087711119999', address: 'Noyontaan, Pekalongan', history: 'Sindrom Lorong Carpal (CTS)', status: 'Aktif' },
      { id: 'RM-017', name: 'Yudi Pratama', birthDate: '1996-09-30', gender: 'Laki-laki', phone: '085611113333', address: 'Kajen Kidul', history: 'Keseleo Pergelangan Tangan', status: 'Aktif' },
      { id: 'RM-018', name: 'Fitri Handayani', birthDate: '1983-11-12', gender: 'Perempuan', phone: '081388887777', address: 'Jl. Diponegoro No. 80', history: 'Nyeri Sendi Panggul', status: 'Aktif' },
      { id: 'RM-019', name: 'Aditya Putra', birthDate: '1999-03-25', gender: 'Laki-laki', phone: '081244443333', address: 'Rowolaku, Kajen', history: 'Tendinitis Patella', status: 'Aktif' },
      { id: 'RM-020', name: 'Diana Putri', birthDate: '1995-07-07', gender: 'Perempuan', phone: '085877776666', address: 'Desa Kembon, Kajen', history: 'Ketegangan Otot Betis', status: 'Aktif' }
    ];

    // 5. Data Registrations (Pendaftaran / Waiting List)
    var registrationsData = [
      { id: 'REG-001', patientId: 'RM-001', therapyId: 'TY-001', therapistId: 'T-001', dateTime: '2026-06-29T09:00', status: 'Completed', symptoms: 'Nyeri lutut kanan sehabis lari marathon' },
      { id: 'REG-002', patientId: 'RM-002', therapyId: 'TY-003', therapistId: 'T-001', dateTime: '2026-06-29T10:00', status: 'In Progress', symptoms: 'Pinggang kaku dan nyeri menjalar saat bangun tidur' },
      { id: 'REG-003', patientId: 'RM-003', therapyId: 'TY-002', therapistId: 'T-002', dateTime: '2026-06-29T11:00', status: 'Waiting', symptoms: 'Bahu kanan kaku sulit mengangkat tangan' },
      { id: 'REG-004', patientId: 'RM-005', therapyId: 'TY-001', therapistId: 'T-001', dateTime: '2026-06-29T13:00', status: 'Waiting', symptoms: 'Leher kaku tidak bisa menoleh ke kiri' },
      { id: 'REG-005', patientId: 'RM-006', therapyId: 'TY-004', therapistId: 'T-002', dateTime: '2026-06-29T14:00', status: 'Waiting', symptoms: 'Bengkak pada pergelangan kaki luar' }
    ];

    // 6. Data Schedules
    var schedulesData = [
      { id: 'SCH-001', therapistId: 'T-001', date: '2026-06-29', startTime: '09:00', endTime: '10:00', status: 'Terisi' },
      { id: 'SCH-002', therapistId: 'T-001', date: '2026-06-29', startTime: '10:00', endTime: '11:00', status: 'Terisi' },
      { id: 'SCH-003', therapistId: 'T-002', date: '2026-06-29', startTime: '11:00', endTime: '12:00', status: 'Terisi' },
      { id: 'SCH-004', therapistId: 'T-001', date: '2026-06-29', startTime: '14:00', endTime: '15:00', status: 'Tersedia' },
      { id: 'SCH-005', therapistId: 'T-002', date: '2026-06-29', startTime: '14:00', endTime: '15:00', status: 'Libur' }
    ];

    // 7. Data Medical Records (SOAP)
    var medicalRecordsData = [
      { id: 'RM-REC-001', date: '2026-06-22', patientId: 'RM-001', therapistId: 'T-001', subjective: 'Pasien mengeluhkan nyeri lutut lateral kanan skala nyeri 5/10 saat ditekuk.', objective: 'Tes lachman negatif, nyeri tekan di ligamentum kolateral lateral.', assessment: 'Sprain LCL Grade I Knee Dekstra', intervention: 'Deep tissue friction lateral knee, passive stretching hamstring, US terapi.', plan: 'Home program: leg raises 3 set 10 repetisi sehari 2x, hindari lompat.' },
      { id: 'RM-REC-002', date: '2026-06-25', patientId: 'RM-002', therapistId: 'T-001', subjective: 'Pinggang terasa pegal kaku, membaik setelah jalan pelan.', objective: 'Keterbatasan fleksi lumbal, palpasi spasme otot erector spinae.', assessment: 'Musculoskeletal LBP e.c Muscle Spasm', intervention: 'MFR (Myofascial Release) lumbar, TENS frekuensi tinggi 15 menit.', plan: 'Stretching lumbal fleksi-ekstensi perlahan di kasur pagi hari.' }
    ];

    var dummyDb = {
      users: usersData,
      patients: patientsData,
      therapists: therapistsData,
      therapies: therapiesData,
      registrations: registrationsData,
      schedules: schedulesData,
      medicalRecords: medicalRecordsData
    };

    // Tulis ke spreadsheet masing-masing sheet
    var sheetsList = ['users', 'patients', 'therapists', 'therapies', 'registrations', 'schedules', 'medicalRecords'];
    
    sheetsList.forEach(function(sName) {
      var sheet = ss.getSheetByName(sName);
      if (sheet) {
        ss.deleteSheet(sheet);
      }
      sheet = ss.insertSheet(sName);
      
      var data = dummyDb[sName];
      if (data && data.length > 0) {
        var headers = Object.keys(data[0]);
        var rows = [headers];
        
        data.forEach(function(rowObj) {
          var row = [];
          headers.forEach(function(h) {
            row.push(rowObj[h] !== undefined ? rowObj[h] : '');
          });
          rows.push(row);
        });
        
        sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
      }
    });

    return { success: true, message: "Berhasil membuat 20 data dummy di Spreadsheet!" };
  } catch(e) {
    return { success: false, error: e.toString() };
  }
}

