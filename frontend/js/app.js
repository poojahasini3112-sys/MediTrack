/**
 * MediTrack Hospital Management System - Core Frontend Application
 * Fully connects UI with Express Backend & MySQL 8.0 Database
 */

const API_BASE = '/api';

// Application State
let currentUser = JSON.parse(localStorage.getItem('meditrack_user') || '{"username":"admin","role":"Admin","name":"Amit Trivedi"}');
let currentToken = localStorage.getItem('meditrack_token') || '';

// Global references for dropdowns
let patientsCache = [];
let doctorsCache = [];
let bedsCache = [];
let diagnosesCache = [];
let medicinesCache = [];
let labTestsCache = [];

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  handleHashNavigation();
  window.addEventListener('hashchange', handleHashNavigation);
  preloadDropdownData();
});

function setupUserHeader() {
  const avatarEl = document.getElementById('sidebar-avatar');
  const userEl = document.getElementById('sidebar-username');
  const roleEl = document.getElementById('sidebar-role');
  const topbarBadge = document.getElementById('topbar-role-badge');
  const btnTopbarRegister = document.getElementById('btn-topbar-register');

  if (avatarEl && currentUser) {
    avatarEl.textContent = (currentUser.name || currentUser.username || 'A')[0].toUpperCase();
  }
  if (userEl && currentUser) {
    userEl.textContent = currentUser.name || currentUser.username;
  }
  if (roleEl && currentUser) {
    const roleColors = {
      Admin: 'bg-primary-subtle text-primary',
      Doctor: 'bg-success-subtle text-success',
      Patient: 'bg-info-subtle text-dark'
    };
    roleEl.className = `badge ${roleColors[currentUser.role] || 'bg-primary-subtle text-primary'}`;
    roleEl.textContent = currentUser.role || 'Admin';
  }
  if (topbarBadge && currentUser) {
    topbarBadge.innerHTML = `<span class="badge ${currentUser.role === 'Doctor' ? 'bg-success' : currentUser.role === 'Patient' ? 'bg-info text-dark' : 'bg-primary'} me-1">${currentUser.role} Portal</span> ${currentUser.name || currentUser.username}`;
  }

  // Adjust Topbar Action Buttons for Role
  if (btnTopbarRegister) {
    if (currentUser.role === 'Patient') {
      btnTopbarRegister.style.display = 'none';
    } else if (currentUser.role === 'Doctor') {
      btnTopbarRegister.innerHTML = '<i class="bi bi-journal-plus me-1"></i><span>New Clinical Rx</span>';
      btnTopbarRegister.onclick = openMedicalRecordModal;
      btnTopbarRegister.style.display = 'inline-flex';
    } else {
      btnTopbarRegister.innerHTML = '<i class="bi bi-person-plus-fill me-1"></i><span>Register Patient</span>';
      btnTopbarRegister.onclick = openPatientModal;
      btnTopbarRegister.style.display = 'inline-flex';
    }
  }

  // Dynamic Sidebar Navigation by Role
  renderRoleSidebar();
}

function renderRoleSidebar() {
  const menuContainer = document.querySelector('.sidebar-menu');
  if (!menuContainer || !currentUser) return;

  if (currentUser.role === 'Patient') {
    menuContainer.innerHTML = `
      <li class="menu-category">Patient Health Portal</li>
      <li class="menu-item">
        <a href="#dashboard" class="menu-link active" onclick="navigate('dashboard')">
          <i class="bi bi-heart-pulse-fill text-danger"></i>
          <span>My Health Overview</span>
        </a>
      </li>
      <li class="menu-category">My Clinical Care</li>
      <li class="menu-item">
        <a href="#appointments" class="menu-link" onclick="navigate('appointments')">
          <i class="bi bi-calendar-check-fill text-primary"></i>
          <span>My Consultations</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#admissions" class="menu-link" onclick="navigate('admissions')">
          <i class="bi bi-hospital text-secondary"></i>
          <span>My Room & Inpatient Stay</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#records" class="menu-link" onclick="navigate('records')">
          <i class="bi bi-journal-medical text-accent"></i>
          <span>My Prescriptions (Rx)</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#laboratory" class="menu-link" onclick="navigate('laboratory')">
          <i class="bi bi-eyedropper text-info"></i>
          <span>My Diagnostic Reports</span>
        </a>
      </li>
      <li class="menu-category">Hospital Directory & Billing</li>
      <li class="menu-item">
        <a href="#doctors" class="menu-link" onclick="navigate('doctors')">
          <i class="bi bi-person-badge-fill text-primary"></i>
          <span>Specialist Doctors</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#billing" class="menu-link" onclick="navigate('billing')">
          <i class="bi bi-receipt-cutoff text-success"></i>
          <span>My Invoices & Payments</span>
        </a>
      </li>
    `;
  } else if (currentUser.role === 'Doctor') {
    menuContainer.innerHTML = `
      <li class="menu-category">Doctor Workstation</li>
      <li class="menu-item">
        <a href="#dashboard" class="menu-link active" onclick="navigate('dashboard')">
          <i class="bi bi-grid-1x2-fill text-primary"></i>
          <span>Doctor Dashboard</span>
        </a>
      </li>
      <li class="menu-category">Clinical Practice</li>
      <li class="menu-item">
        <a href="#appointments" class="menu-link" onclick="navigate('appointments')">
          <i class="bi bi-calendar-check-fill text-secondary"></i>
          <span>Consultation Queue</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#admissions" class="menu-link" onclick="navigate('admissions')">
          <i class="bi bi-hospital-fill text-danger"></i>
          <span>Inpatient Ward Rounds</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#records" class="menu-link" onclick="navigate('records')">
          <i class="bi bi-journal-medical text-accent"></i>
          <span>Medical Records & Rx</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#patients" class="menu-link" onclick="navigate('patients')">
          <i class="bi bi-people-fill text-primary"></i>
          <span>Patient Directory</span>
        </a>
      </li>
      <li class="menu-category">Diagnostics & Hospital</li>
      <li class="menu-item">
        <a href="#laboratory" class="menu-link" onclick="navigate('laboratory')">
          <i class="bi bi-eyedropper text-info"></i>
          <span>Laboratory Test Reports</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#doctors" class="menu-link" onclick="navigate('doctors')">
          <i class="bi bi-person-badge-fill text-secondary"></i>
          <span>Medical Staff & Schedule</span>
        </a>
      </li>
      <li class="menu-item">
        <a href="#departments" class="menu-link" onclick="navigate('departments')">
          <i class="bi bi-diagram-3-fill text-accent"></i>
          <span>Clinical Departments</span>
        </a>
      </li>
    `;
  }
}

function logout() {
  localStorage.removeItem('meditrack_token');
  localStorage.removeItem('meditrack_user');
  window.location.href = '/login.html';
}

function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
}

function navigate(viewName) {
  // Update active sidebar link
  document.querySelectorAll('.menu-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${viewName}`) {
      link.classList.add('active');
    }
  });

  const titles = {
    dashboard: currentUser && currentUser.role === 'Patient'
      ? ['My Health Dashboard', 'Personal clinical records, appointments & inpatient stay overview']
      : currentUser && currentUser.role === 'Doctor'
      ? ['Doctor Clinical Workstation', 'Today\'s consultation queue, inpatient ward rounds & prescriptions']
      : ['Executive Dashboard', 'Real-time hospital operations overview & KPIs'],
    patients: ['Patient Management', 'Demographics, medical history, allergies & emergency contacts'],
    appointments: currentUser && currentUser.role === 'Patient'
      ? ['My Consultations', 'Scheduled outpatient appointments & consultation history']
      : currentUser && currentUser.role === 'Doctor'
      ? ['Doctor Consultation Queue', 'Today\'s patient appointments & consultation schedule']
      : ['Appointment Scheduling', 'Doctor outpatient consultations & status tracking'],
    admissions: currentUser && currentUser.role === 'Patient'
      ? ['My Room & Inpatient Stay', 'Active room allocation, bed number & admission records']
      : ['Inpatient Admissions & Bed Allocation', 'Live ward occupancy, rooms, beds & discharge management'],
    records: currentUser && currentUser.role === 'Patient'
      ? ['My Prescriptions & Medical Records', 'Prescribed medications, dosage instructions & diagnosis records']
      : ['Medical Records & Prescriptions', 'Clinical encounters, ICD-10 diagnoses & multi-item Rx'],
    doctors: ['Doctors & Medical Staff', 'Physicians, specialists, nurses, and weekly consultation schedules'],
    departments: ['Clinical Departments', 'Specialized medical divisions, heads of department, and facilities'],
    laboratory: currentUser && currentUser.role === 'Patient'
      ? ['My Diagnostic Reports', 'Laboratory test findings, pathology reports & results']
      : ['Laboratory Services', 'Diagnostic test catalog, sample orders, and pathologist reports'],
    pharmacy: ['Pharmacy & Medicine Inventory', 'Pharmaceutical stocks, batch expiry tracking, and purchase orders'],
    billing: currentUser && currentUser.role === 'Patient'
      ? ['My Invoices & Payments', 'Consultation fees, hospital room charges & payment receipts']
      : ['Billing, Payments & Insurance', 'Inpatient/OPD invoices, payment collections, and insurance claims'],
    audit: ['Security & Audit Trail', 'User accounts, role-based access control, and immutable change logs']
  };

  const [title, subtitle] = titles[viewName] || ['Hospital Management', 'Clinical Enterprise'];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = subtitle;

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="text-muted mt-2">Loading ${title}...</p></div>`;

  switch (viewName) {
    case 'dashboard': loadDashboard(); break;
    case 'patients': loadPatients(); break;
    case 'appointments': loadAppointments(); break;
    case 'admissions': loadAdmissions(); break;
    case 'records': loadRecords(); break;
    case 'doctors': loadDoctors(); break;
    case 'departments': loadDepartments(); break;
    case 'laboratory': loadLaboratory(); break;
    case 'pharmacy': loadPharmacy(); break;
    case 'billing': loadBilling(); break;
    case 'audit': loadAudit(); break;
    default: loadDashboard();
  }
}

// -------------------------------------------------------------
// API FETCH WRAPPER
// -------------------------------------------------------------
async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    showToast(`Error communicating with backend: ${error.message}`, 'danger');
    return { success: false, message: error.message };
  }
}

// -------------------------------------------------------------
// TOAST NOTIFICATIONS
// -------------------------------------------------------------
function showToast(message, type = 'info') {
  const wrapper = document.getElementById('toast-wrapper');
  if (!wrapper) return;

  const toastId = `toast-${Date.now()}`;
  const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';
  const bgClass = type === 'success' ? 'bg-success text-white' : type === 'danger' ? 'bg-danger text-white' : 'bg-primary text-white';

  const html = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon} fs-5"></i>
          <span>${message}</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  wrapper.insertAdjacentHTML('beforeend', html);
  const toastEl = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
  bsToast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// -------------------------------------------------------------
// PRELOAD DROPDOWN DATA FOR MODALS
// -------------------------------------------------------------
async function preloadDropdownData() {
  const [pRes, dRes, bRes, diagRes, mRes, lRes] = await Promise.all([
    fetchAPI('/patients'),
    fetchAPI('/doctors'),
    fetchAPI('/beds?status=Available'),
    fetchAPI('/diagnoses'),
    fetchAPI('/pharmacy/medicines'),
    fetchAPI('/lab/tests')
  ]);

  if (pRes.success) patientsCache = pRes.data;
  if (dRes.success) doctorsCache = dRes.data;
  if (bRes.success) bedsCache = bRes.data;
  if (diagRes.success) diagnosesCache = diagRes.data;
  if (mRes.success) medicinesCache = mRes.data;
  if (lRes.success) labTestsCache = lRes.data;
}

// -------------------------------------------------------------
// VIEW 1: DASHBOARD (ROLE-BASED: ADMIN, DOCTOR, PATIENT)
// -------------------------------------------------------------
async function loadDashboard() {
  if (currentUser && currentUser.role === 'Patient') {
    return loadPatientDashboard();
  }
  if (currentUser && currentUser.role === 'Doctor') {
    return loadDoctorDashboard();
  }

  const res = await fetchAPI('/dashboard/stats');
  if (!res.success) return;
  const { stats, recentAdmissions, upcomingAppointments, bedBreakdown } = res;

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Top KPI Row -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Total Registered Patients</span>
                <div class="stat-value text-primary">${stats.totalPatients}</div>
              </div>
              <div class="stat-icon primary"><i class="bi bi-people-fill"></i></div>
            </div>
            <div class="mt-2 text-muted small"><i class="bi bi-shield-check text-success me-1"></i> Active Clinical Records</div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Active Inpatient Admissions</span>
                <div class="stat-value text-secondary">${stats.activeAdmissions}</div>
              </div>
              <div class="stat-icon secondary"><i class="bi bi-hospital-fill"></i></div>
            </div>
            <div class="mt-2 text-muted small">Bed Occupancy: <strong>${stats.bedOccupancyRate}%</strong> (${stats.occupiedBeds}/${stats.totalBeds} beds)</div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Specialist Doctors</span>
                <div class="stat-value text-accent">${stats.totalDoctors}</div>
              </div>
              <div class="stat-icon accent"><i class="bi bi-person-badge-fill"></i></div>
            </div>
            <div class="mt-2 text-muted small">Across 8 Specialized Departments</div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Total Revenue Collected</span>
                <div class="stat-value text-success">₹${stats.totalRevenue.toLocaleString('en-IN')}</div>
              </div>
              <div class="stat-icon success"><i class="bi bi-cash-stack"></i></div>
            </div>
            <div class="mt-2 text-muted small"><i class="bi bi-check-all text-success"></i> Cashless Insurance & Digital UPI</div>
          </div>
        </div>
      </div>

      <!-- Quick Operations Banner -->
      <div class="content-card p-3 mb-4 bg-white border-0 shadow-sm" style="border-left: 4px solid var(--primary) !important;">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h6 class="fw-bold mb-1"><i class="bi bi-lightning-charge-fill text-warning me-2"></i>Quick Clinical Actions</h6>
            <p class="text-muted small mb-0">Direct shortcuts to frequent hospital workflow forms</p>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-primary" onclick="openPatientModal()"><i class="bi bi-person-plus me-1"></i> Register Patient</button>
            <button class="btn btn-sm btn-outline-primary" onclick="openAppointmentModal()"><i class="bi bi-calendar-plus me-1"></i> Book Appointment</button>
            <button class="btn btn-sm btn-outline-success" onclick="openAdmissionModal()"><i class="bi bi-hospital me-1"></i> Inpatient Admission</button>
            <button class="btn btn-sm btn-outline-secondary" onclick="openMedicalRecordModal()"><i class="bi bi-journal-plus me-1"></i> Write Clinical Rx</button>
            <button class="btn btn-sm btn-outline-info" onclick="openLabOrderModal()"><i class="bi bi-eyedropper me-1"></i> Order Lab Test</button>
          </div>
        </div>
      </div>

      <!-- Tables Row: Recent Admissions & Upcoming Consultations -->
      <div class="row g-4">
        <!-- Recent Admissions -->
        <div class="col-lg-6">
          <div class="content-card h-100">
            <div class="card-header-custom">
              <h5><i class="bi bi-heart-pulse text-danger"></i> Recent Inpatient Admissions</h5>
              <button class="btn btn-sm btn-outline-primary" onclick="navigate('admissions')">View All</button>
            </div>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Doctor</th>
                    <th>Room / Bed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentAdmissions.length === 0 ? '<tr><td colspan="5" class="text-center text-muted py-3">No recent admissions</td></tr>' : 
                    recentAdmissions.map(a => `
                      <tr>
                        <td>
                          <strong>${a.Patient_Name}</strong>
                          <div class="text-muted small">${a.Admission_Reason}</div>
                        </td>
                        <td><span class="badge ${a.Admission_Type === 'Emergency' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'}">${a.Admission_Type}</span></td>
                        <td>${a.Doctor_Name}</td>
                        <td>${a.Room_Number ? `${a.Room_Number} (${a.Bed_Number})` : '<span class="text-muted">Unassigned</span>'}</td>
                        <td><span class="badge-custom ${a.Status === 'Admitted' ? 'badge-warning-soft' : 'badge-success-soft'}">${a.Status}</span></td>
                      </tr>
                    `).join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Upcoming Appointments -->
        <div class="col-lg-6">
          <div class="content-card h-100">
            <div class="card-header-custom">
              <h5><i class="bi bi-calendar-event text-primary"></i> Scheduled Consultations</h5>
              <button class="btn btn-sm btn-outline-primary" onclick="navigate('appointments')">View All</button>
            </div>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${upcomingAppointments.length === 0 ? '<tr><td colspan="5" class="text-center text-muted py-3">No appointments scheduled</td></tr>' :
                    upcomingAppointments.map(ap => `
                      <tr>
                        <td>
                          <strong>${ap.Patient_Name}</strong>
                          <div class="text-muted small">${ap.Phone}</div>
                        </td>
                        <td>
                          <div>${ap.Doctor_Name}</div>
                          <small class="text-muted">${ap.Specialization}</small>
                        </td>
                        <td>
                          <div>${formatDate(ap.Appointment_Date)}</div>
                          <small class="text-muted">${ap.Appointment_Time.slice(0, 5)}</small>
                        </td>
                        <td><small>${ap.Reason}</small></td>
                        <td><span class="badge-custom ${ap.Status === 'Completed' ? 'badge-success-soft' : ap.Status === 'Cancelled' ? 'badge-danger-soft' : 'badge-primary-soft'}">${ap.Status}</span></td>
                      </tr>
                    `).join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// PATIENT HEALTH PORTAL DASHBOARD
// -------------------------------------------------------------
async function loadPatientDashboard() {
  const patientId = currentUser.patientId || 1;
  const contentArea = document.getElementById('dynamic-content');

  // Fetch patient-specific records
  const [appRes, admRes, recRes, billRes] = await Promise.all([
    fetchAPI(`/appointments?patientId=${patientId}`),
    fetchAPI(`/admissions?patientId=${patientId}`),
    fetchAPI(`/medical-records?patientId=${patientId}`),
    fetchAPI(`/billing/bills?patientId=${patientId}`)
  ]);

  const appointments = (appRes.success && appRes.data) || [];
  const admissions = (admRes.success && admRes.data) || [];
  const records = (recRes.success && recRes.data) || [];
  const bills = (billRes.success && billRes.data) || [];

  const activeAdmission = admissions.find(a => a.Status === 'Admitted') || admissions[0] || null;
  const nextApp = appointments.find(a => a.Status === 'Scheduled') || appointments[0] || null;
  const unpaidBills = bills.filter(b => b.Payment_Status !== 'Paid');
  const totalPendingAmount = unpaidBills.reduce((acc, b) => acc + parseFloat(b.Net_Amount || 0), 0);

  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Patient Welcome Hero Banner -->
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 text-white" style="background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 30px; border: 2px solid rgba(255,255,255,0.3);">
              <i class="bi bi-person-heart"></i>
            </div>
            <div>
              <span class="badge bg-white text-primary fw-bold mb-1"><i class="bi bi-shield-check"></i> Patient Care Portal</span>
              <h3 class="fw-bold mb-0">Welcome, ${currentUser.name}!</h3>
              <p class="mb-0 text-white-50 small mt-1">
                Patient ID: <strong>#PID-${String(patientId).padStart(4, '0')}</strong> &bull; Care Status: <strong class="text-white">${activeAdmission ? 'Inpatient Stay (Admitted)' : 'Outpatient Care (Active)'}</strong>
              </p>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-light fw-semibold text-primary shadow-sm" onclick="openAppointmentModal()">
              <i class="bi bi-calendar-plus me-1"></i> Book Consultation
            </button>
            <button class="btn btn-outline-light fw-semibold" onclick="navigate('records')">
              <i class="bi bi-journal-medical me-1"></i> View Prescriptions
            </button>
          </div>
        </div>
      </div>

      <!-- Patient Health KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <!-- Next Appointment -->
        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Upcoming Consultation</span>
                <div class="stat-value text-primary fs-5 mt-1" style="line-height: 1.3;">
                  ${nextApp ? nextApp.Doctor_Name : 'None Scheduled'}
                </div>
              </div>
              <div class="stat-icon primary"><i class="bi bi-calendar-event"></i></div>
            </div>
            <div class="mt-2 text-muted small">
              ${nextApp ? `<i class="bi bi-clock text-primary me-1"></i>${formatDate(nextApp.Appointment_Date)} at ${nextApp.Appointment_Time}` : 'Click Book Consultation anytime'}
            </div>
          </div>
        </div>

        <!-- Room & Bed Allocation -->
        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Room & Bed Allocation</span>
                <div class="stat-value text-secondary fs-5 mt-1" style="line-height: 1.3;">
                  ${activeAdmission && activeAdmission.Room_Number ? `Room ${activeAdmission.Room_Number}` : 'Outpatient'}
                </div>
              </div>
              <div class="stat-icon secondary"><i class="bi bi-hospital"></i></div>
            </div>
            <div class="mt-2 text-muted small">
              ${activeAdmission ? `<span class="badge bg-secondary-subtle text-secondary me-1">Bed ${activeAdmission.Bed_Number || 'Assigned'}</span> (${activeAdmission.Room_Type || 'Ward'})` : 'No active inpatient stay'}
            </div>
          </div>
        </div>

        <!-- Active Prescriptions -->
        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Prescriptions & Rx</span>
                <div class="stat-value text-accent">${records.length} Records</div>
              </div>
              <div class="stat-icon accent"><i class="bi bi-capsule"></i></div>
            </div>
            <div class="mt-2 text-muted small"><i class="bi bi-check-circle-fill text-success me-1"></i> Issued by MediTrack Physicians</div>
          </div>
        </div>

        <!-- Billing Balance -->
        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Hospital Invoices</span>
                <div class="stat-value ${totalPendingAmount > 0 ? 'text-danger' : 'text-success'}">
                  ₹${totalPendingAmount.toLocaleString('en-IN')}
                </div>
              </div>
              <div class="stat-icon ${totalPendingAmount > 0 ? 'danger' : 'success'}"><i class="bi bi-receipt"></i></div>
            </div>
            <div class="mt-2 text-muted small">
              ${totalPendingAmount > 0 ? `<span class="text-danger fw-semibold">${unpaidBills.length} Bill(s) Pending</span>` : '<span class="text-success fw-semibold"><i class="bi bi-check-all"></i> All Invoices Settled</span>'}
            </div>
          </div>
        </div>
      </div>

      <!-- Inpatient Care & Consultations Row -->
      <div class="row g-4 mb-4">
        <!-- Inpatient Room & Stay Details -->
        <div class="col-lg-6">
          <div class="content-card h-100">
            <div class="card-header-custom">
              <h5><i class="bi bi-hospital text-primary me-2"></i> My Clinical Admission Stay</h5>
              <button class="btn btn-sm btn-outline-primary" onclick="navigate('admissions')">View Ward</button>
            </div>
            <div class="p-3">
              ${activeAdmission ? `
                <div class="border rounded-3 p-3 bg-light mb-3">
                  <div class="row g-2">
                    <div class="col-6"><small class="text-muted d-block">Attending Doctor:</small><strong class="text-dark"><i class="bi bi-person-badge text-primary me-1"></i>${activeAdmission.Doctor_Name}</strong></div>
                    <div class="col-6"><small class="text-muted d-block">Specialization:</small><span class="badge bg-primary-subtle text-primary">${activeAdmission.Specialization || 'Clinical Care'}</span></div>
                    <div class="col-6 mt-2"><small class="text-muted d-block">Room Assigned:</small><strong>Room ${activeAdmission.Room_Number} (${activeAdmission.Room_Type || 'Deluxe'})</strong></div>
                    <div class="col-6 mt-2"><small class="text-muted d-block">Bed Allocation:</small><span class="badge bg-success-subtle text-success">Bed #${activeAdmission.Bed_Number || 'Assigned'}</span></div>
                    <div class="col-6 mt-2"><small class="text-muted d-block">Admitted On:</small><span class="text-dark">${formatDate(activeAdmission.Admitted_Date)}</span></div>
                    <div class="col-6 mt-2"><small class="text-muted d-block">Stay Status:</small><span class="badge bg-success">${activeAdmission.Status}</span></div>
                    <div class="col-12 mt-2"><small class="text-muted d-block">Admission Reason:</small><span class="text-secondary">${activeAdmission.Admission_Reason || 'Standard clinical observation & treatment'}</span></div>
                  </div>
                </div>
              ` : `
                <div class="text-center py-4 text-muted">
                  <i class="bi bi-info-circle fs-3 d-block mb-2 text-secondary"></i>
                  <p class="mb-0">You are currently registered as an <strong>Outpatient</strong>.<br>No inpatient room stay is active.</p>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Scheduled Appointments -->
        <div class="col-lg-6">
          <div class="content-card h-100">
            <div class="card-header-custom">
              <h5><i class="bi bi-calendar-check text-secondary me-2"></i> My Consultations</h5>
              <button class="btn btn-sm btn-primary" onclick="openAppointmentModal()"><i class="bi bi-plus me-1"></i> Book</button>
            </div>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Doctor</th>
                    <th>Room</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${appointments.length === 0 ? '<tr><td colspan="4" class="text-center py-4 text-muted">No appointments booked yet. Click Book to schedule.</td></tr>' : 
                    appointments.slice(0, 5).map(ap => `
                      <tr>
                        <td>
                          <strong>${formatDate(ap.Appointment_Date)}</strong>
                          <div class="text-muted small">${ap.Appointment_Time}</div>
                        </td>
                        <td>
                          <div class="fw-semibold">${ap.Doctor_Name}</div>
                          <small class="text-muted">${ap.Specialization}</small>
                        </td>
                        <td>${ap.Room_Number ? 'OPD ' + ap.Room_Number : 'Room 101'}</td>
                        <td><span class="badge ${ap.Status === 'Scheduled' ? 'bg-primary' : ap.Status === 'Completed' ? 'bg-success' : 'bg-danger'}">${ap.Status}</span></td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Prescriptions and Bills Row -->
      <div class="row g-4">
        <!-- Medical Records & Rx -->
        <div class="col-lg-6">
          <div class="content-card h-100">
            <div class="card-header-custom">
              <h5><i class="bi bi-capsule text-accent me-2"></i> My Prescriptions & Treatment</h5>
              <button class="btn btn-sm btn-outline-primary" onclick="navigate('records')">View All</button>
            </div>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Visit Date</th>
                    <th>Diagnosis</th>
                    <th>Physician</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.length === 0 ? '<tr><td colspan="3" class="text-center py-4 text-muted">No clinical records found.</td></tr>' :
                    records.slice(0, 5).map(r => `
                      <tr>
                        <td><strong>${formatDate(r.Visit_Date)}</strong></td>
                        <td><span class="badge bg-info-subtle text-dark">${r.Diagnoses_List || 'Clinical Consultation'}</span></td>
                        <td>${r.Doctor_Name}</td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Hospital Bills -->
        <div class="col-lg-6">
          <div class="content-card h-100">
            <div class="card-header-custom">
              <h5><i class="bi bi-receipt-cutoff text-success me-2"></i> My Invoices & Payments</h5>
              <button class="btn btn-sm btn-outline-primary" onclick="navigate('billing')">View All Bills</button>
            </div>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Bill #</th>
                    <th>Date</th>
                    <th>Net Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${bills.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-muted">No hospital invoices billed to your account.</td></tr>' :
                    bills.slice(0, 5).map(b => `
                      <tr>
                        <td><strong>#INV-${b.Bill_ID}</strong></td>
                        <td>${formatDate(b.Bill_Date)}</td>
                        <td class="fw-bold">₹${parseFloat(b.Net_Amount).toLocaleString('en-IN')}</td>
                        <td><span class="badge ${b.Payment_Status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}">${b.Payment_Status}</span></td>
                        <td>
                          ${b.Payment_Status !== 'Paid' ? `
                            <button class="btn btn-sm btn-success px-2 py-0" onclick="openPaymentModal(${b.Bill_ID}, ${b.Net_Amount})">
                              <i class="bi bi-credit-card me-1"></i>Pay Now
                            </button>
                          ` : `<span class="text-success small fw-semibold"><i class="bi bi-check-circle me-1"></i>Settled</span>`}
                        </td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// DOCTOR CLINICAL WORKSTATION DASHBOARD
// -------------------------------------------------------------
async function loadDoctorDashboard() {
  const doctorStaffId = currentUser.staffId || 1;
  const contentArea = document.getElementById('dynamic-content');

  // Fetch doctor-specific records
  const [appRes, admRes, recRes, statsRes] = await Promise.all([
    fetchAPI(`/appointments?doctorId=${doctorStaffId}`),
    fetchAPI('/admissions'),
    fetchAPI(`/medical-records?doctorId=${doctorStaffId}`),
    fetchAPI('/dashboard/stats')
  ]);

  const appointments = (appRes.success && appRes.data) || [];
  const allAdmissions = (admRes.success && admRes.data) || [];
  const records = (recRes.success && recRes.data) || [];
  const myInpatients = allAdmissions.filter(a => a.Attending_Doctor_ID === doctorStaffId || a.Status === 'Admitted');

  // Today's appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter(a => (a.Appointment_Date || '').startsWith(todayStr) || a.Status === 'Scheduled');

  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Doctor Hero Banner -->
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 text-white" style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 30px; border: 2px solid rgba(255,255,255,0.3);">
              <i class="bi bi-heart-pulse-fill"></i>
            </div>
            <div>
              <span class="badge bg-white text-dark fw-bold mb-1"><i class="bi bi-stethoscope"></i> Doctor Clinical Workstation</span>
              <h3 class="fw-bold mb-0">Welcome, Dr. ${currentUser.name}!</h3>
              <p class="mb-0 text-white-50 small mt-1">
                Specialist Practitioner &bull; Staff ID: <strong>#STF-${String(doctorStaffId).padStart(3, '0')}</strong> &bull; MediTrack Clinical Department
              </p>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-light fw-semibold text-dark shadow-sm" onclick="openMedicalRecordModal()">
              <i class="bi bi-journal-plus me-1"></i> New Clinical Record (Rx)
            </button>
            <button class="btn btn-outline-light fw-semibold" onclick="openLabOrderModal()">
              <i class="bi bi-eyedropper me-1"></i> Order Lab Test
            </button>
          </div>
        </div>
      </div>

      <!-- Doctor Clinical KPIs -->
      <div class="row g-3 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Scheduled Consultations</span>
                <div class="stat-value text-primary">${todayApps.length} Patients</div>
              </div>
              <div class="stat-icon primary"><i class="bi bi-calendar-check-fill"></i></div>
            </div>
            <div class="mt-2 text-muted small"><i class="bi bi-clock-history text-primary me-1"></i> In Today's Outpatient Queue</div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Inpatients in Ward</span>
                <div class="stat-value text-secondary">${myInpatients.length} Active</div>
              </div>
              <div class="stat-icon secondary"><i class="bi bi-hospital-fill"></i></div>
            </div>
            <div class="mt-2 text-muted small">Admitted Ward Beds for Daily Rounds</div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Clinical Encounters</span>
                <div class="stat-value text-accent">${records.length} Completed</div>
              </div>
              <div class="stat-icon accent"><i class="bi bi-journal-check"></i></div>
            </div>
            <div class="mt-2 text-muted small">Diagnoses & Prescriptions Written</div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="stat-card">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <span class="stat-label">Hospital Bed Capacity</span>
                <div class="stat-value text-success">${statsRes.stats ? statsRes.stats.occupiedBeds : 0} / ${statsRes.stats ? statsRes.stats.totalBeds : 0}</div>
              </div>
              <div class="stat-icon success"><i class="bi bi-pie-chart-fill"></i></div>
            </div>
            <div class="mt-2 text-muted small">Current Inpatient Ward Occupancy</div>
          </div>
        </div>
      </div>

      <!-- Tables: Consultation Queue & Inpatient Ward -->
      <div class="row g-4">
        <!-- Consultation Queue -->
        <div class="col-lg-6">
          <div class="content-card h-100">
            <div class="card-header-custom">
              <h5><i class="bi bi-calendar-check text-primary me-2"></i> My Consultation Queue</h5>
              <button class="btn btn-sm btn-outline-primary" onclick="navigate('appointments')">Full Queue</button>
            </div>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${appointments.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-muted">No appointments assigned.</td></tr>' :
                    appointments.slice(0, 6).map(ap => `
                      <tr>
                        <td>
                          <div class="fw-bold">${ap.Patient_Name}</div>
                          <small class="text-muted">Blood: ${ap.Blood_Group || 'O+'}</small>
                        </td>
                        <td>${ap.Appointment_Time}</td>
                        <td><small>${ap.Reason || 'Regular checkup'}</small></td>
                        <td><span class="badge ${ap.Status === 'Scheduled' ? 'bg-primary' : 'bg-success'}">${ap.Status}</span></td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary px-2 py-0" onclick="openMedicalRecordModal()">
                            <i class="bi bi-pencil-square me-1"></i>Rx
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Ward Inpatients -->
        <div class="col-lg-6">
          <div class="content-card h-100">
            <div class="card-header-custom">
              <h5><i class="bi bi-hospital text-danger me-2"></i> Inpatient Ward Admissions</h5>
              <button class="btn btn-sm btn-outline-primary" onclick="navigate('admissions')">Bed Board</button>
            </div>
            <div class="table-responsive">
              <table class="table table-custom">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Room & Bed</th>
                    <th>Admitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${myInpatients.length === 0 ? '<tr><td colspan="4" class="text-center py-4 text-muted">No inpatients currently admitted.</td></tr>' :
                    myInpatients.slice(0, 6).map(adm => `
                      <tr>
                        <td><strong>${adm.Patient_Name}</strong></td>
                        <td>
                          <span class="badge bg-secondary-subtle text-secondary">Room ${adm.Room_Number || '101'}</span>
                          <span class="badge bg-success-subtle text-success">Bed ${adm.Bed_Number || 'A'}</span>
                        </td>
                        <td><small>${formatDate(adm.Admitted_Date)}</small></td>
                        <td><span class="badge bg-success">${adm.Status}</span></td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
async function loadPatients() {
  const res = await fetchAPI('/patients');
  if (!res.success) return;
  const patients = res.data;

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <div class="content-card">
        <div class="card-header-custom flex-wrap gap-2">
          <h5><i class="bi bi-people text-primary"></i> Patient Directory (${patients.length} Registered)</h5>
          <div class="d-flex gap-2">
            <input type="text" id="patient-search-input" class="form-control form-control-sm" placeholder="Search by name, phone..." oninput="filterPatientsTable(this.value)" style="width: 240px;">
            <button class="btn btn-sm btn-primary" onclick="openPatientModal()"><i class="bi bi-person-plus me-1"></i> Register Patient</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-custom" id="table-patients">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Gender / DOB</th>
                <th>Blood Group</th>
                <th>Phone & Email</th>
                <th>Emergency Contact</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${patients.map(p => `
                <tr>
                  <td><strong>#${p.Patient_ID}</strong></td>
                  <td>
                    <div class="fw-bold">${p.First_Name} ${p.Last_Name}</div>
                    <small class="text-muted">${p.Address ? p.Address.substring(0, 30) + '...' : ''}</small>
                  </td>
                  <td>
                    <div>${p.Gender}</div>
                    <small class="text-muted">${formatDate(p.Date_Of_Birth)}</small>
                  </td>
                  <td><span class="badge bg-danger-subtle text-danger fw-bold">${p.Blood_Group}</span></td>
                  <td>
                    <div>${p.Phone}</div>
                    <small class="text-muted">${p.Email || 'No email'}</small>
                  </td>
                  <td>
                    <div>${p.Emergency_Contact_Name || 'None'}</div>
                    <small class="text-muted">${p.Emergency_Contact_Phone || ''}</small>
                  </td>
                  <td><small class="text-muted">${formatDate(p.Registration_Date)}</small></td>
                  <td><span class="badge-custom ${p.Status === 'Active' ? 'badge-success-soft' : 'badge-neutral-soft'}">${p.Status}</span></td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewPatient360(${p.Patient_ID})" title="Clinical 360° Profile">
                      <i class="bi bi-eye"></i> View 360°
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function filterPatientsTable(term) {
  const t = term.toLowerCase();
  document.querySelectorAll('#table-patients tbody tr').forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(t) ? '' : 'none';
  });
}

// -------------------------------------------------------------
// PATIENT 360° PROFILE MODAL
// -------------------------------------------------------------
async function viewPatient360(patientId) {
  const modalEl = document.getElementById('modal-patient-details');
  const bodyEl = document.getElementById('patient-details-body');
  bodyEl.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div><p class="text-muted mt-2">Loading clinical profile...</p></div>';
  
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();

  const res = await fetchAPI(`/patients/${patientId}`);
  if (!res.success) {
    bodyEl.innerHTML = '<div class="alert alert-danger">Failed to load patient record.</div>';
    return;
  }
  const p = res.data;

  bodyEl.innerHTML = `
    <!-- Patient Header Card -->
    <div class="p-3 mb-4 rounded-3" style="background: linear-gradient(135deg, #e0f2fe, #ccfbf1); border: 1px solid #bae6fd;">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="stat-icon primary" style="width: 58px; height: 58px; font-size: 26px;">
            <i class="bi bi-person-badge"></i>
          </div>
          <div>
            <h4 class="mb-0 fw-bold text-dark">${p.First_Name} ${p.Last_Name} <span class="badge bg-primary fs-6">ID #${p.Patient_ID}</span></h4>
            <div class="text-muted small">DOB: ${formatDate(p.Date_Of_Birth)} | Gender: ${p.Gender} | Blood Group: <strong class="text-danger">${p.Blood_Group}</strong></div>
          </div>
        </div>
        <div class="text-end">
          <div><i class="bi bi-telephone-fill me-1 text-primary"></i> ${p.Phone}</div>
          <small class="text-muted">${p.Email || 'No email registered'}</small>
        </div>
      </div>
    </div>

    <!-- Clinical Nav Tabs -->
    <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
      <li class="nav-item"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#tab-history">Medical History (${p.medicalHistory.length})</button></li>
      <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-allergies">Allergies (${p.allergies.length})</button></li>
      <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-contacts">Emergency Contacts (${p.emergencyContacts.length})</button></li>
      <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-admissions">Admissions (${p.admissions.length})</button></li>
      <li class="nav-item"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#tab-bills">Billing & Invoices (${p.bills.length})</button></li>
    </ul>

    <div class="tab-content" id="pills-tabContent">
      <!-- History -->
      <div class="tab-pane fade show active" id="tab-history">
        ${p.medicalHistory.length === 0 ? '<p class="text-muted">No prior medical history recorded.</p>' : `
          <ul class="list-group">
            ${p.medicalHistory.map(h => `
              <li class="list-group-item d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="mb-1 fw-bold">${h.Condition_Name}</h6>
                  <p class="mb-0 text-muted small">${h.Notes || 'No notes'}</p>
                </div>
                <div class="text-end">
                  <span class="badge bg-secondary">${h.Status}</span>
                  <div class="text-muted small mt-1">Diagnosed: ${formatDate(h.Diagnosed_Date)}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        `}
      </div>

      <!-- Allergies -->
      <div class="tab-pane fade" id="tab-allergies">
        ${p.allergies.length === 0 ? '<p class="text-muted">No allergies recorded.</p>' : `
          <div class="row g-2">
            ${p.allergies.map(al => `
              <div class="col-md-6">
                <div class="p-3 border rounded-3 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i> ${al.Allergen}</strong>
                    <span class="badge ${al.Severity === 'Critical' || al.Severity === 'Severe' ? 'bg-danger' : 'bg-warning text-dark'}">${al.Severity}</span>
                  </div>
                  <div class="small text-muted">Reaction: ${al.Reaction}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Contacts -->
      <div class="tab-pane fade" id="tab-contacts">
        ${p.emergencyContacts.length === 0 ? '<p class="text-muted">No emergency contacts listed.</p>' : `
          <ul class="list-group">
            ${p.emergencyContacts.map(c => `
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-0 fw-bold">${c.Contact_Name} (${c.Relationship})</h6>
                  <small class="text-muted">${c.Address || 'No address'}</small>
                </div>
                <div>
                  <span class="badge bg-primary">${c.Phone}</span>
                </div>
              </li>
            `).join('')}
          </ul>
        `}
      </div>

      <!-- Admissions -->
      <div class="tab-pane fade" id="tab-admissions">
        ${p.admissions.length === 0 ? '<p class="text-muted">No inpatient hospitalizations recorded.</p>' : `
          <table class="table table-sm">
            <thead>
              <tr><th>Admission ID</th><th>Admitted Date</th><th>Reason</th><th>Attending Doctor</th><th>Room & Bed</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${p.admissions.map(adm => `
                <tr>
                  <td>#${adm.Admission_ID}</td>
                  <td>${formatDate(adm.Admitted_Date)}</td>
                  <td>${adm.Admission_Reason}</td>
                  <td>${adm.Doctor_Name}</td>
                  <td>${adm.Room_Number || '-'} (${adm.Bed_Number || '-'})</td>
                  <td><span class="badge-custom ${adm.Status === 'Admitted' ? 'badge-warning-soft' : 'badge-success-soft'}">${adm.Status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>

      <!-- Bills -->
      <div class="tab-pane fade" id="tab-bills">
        ${p.bills.length === 0 ? '<p class="text-muted">No billing invoices found.</p>' : `
          <table class="table table-sm">
            <thead>
              <tr><th>Bill ID</th><th>Date</th><th>Total Amount</th><th>Discount</th><th>Net Amount</th><th>Paid Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${p.bills.map(b => `
                <tr>
                  <td>#${b.Bill_ID}</td>
                  <td>${formatDate(b.Bill_Date)}</td>
                  <td>₹${parseFloat(b.Total_Amount).toLocaleString('en-IN')}</td>
                  <td>₹${parseFloat(b.Discount_Amount).toLocaleString('en-IN')}</td>
                  <td><strong>₹${parseFloat(b.Net_Amount).toLocaleString('en-IN')}</strong></td>
                  <td>₹${parseFloat(b.Paid_Amount).toLocaleString('en-IN')}</td>
                  <td><span class="badge-custom ${b.Payment_Status === 'Paid' ? 'badge-success-soft' : 'badge-warning-soft'}">${b.Payment_Status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// VIEW 3: OUTPATIENT APPOINTMENT SCHEDULING
// -------------------------------------------------------------
async function loadAppointments() {
  let endpoint = '/appointments';
  if (currentUser && currentUser.role === 'Patient' && currentUser.patientId) {
    endpoint += `?patientId=${currentUser.patientId}`;
  } else if (currentUser && currentUser.role === 'Doctor' && currentUser.staffId) {
    endpoint += `?doctorId=${currentUser.staffId}`;
  }
  const res = await fetchAPI(endpoint);
  if (!res.success) return;
  const appointments = res.data;

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <div class="content-card">
        <div class="card-header-custom flex-wrap gap-2">
          <h5><i class="bi bi-calendar-check text-primary"></i> Outpatient Appointments (${appointments.length})</h5>
          <button class="btn btn-sm btn-primary" onclick="openAppointmentModal()"><i class="bi bi-calendar-plus me-1"></i> Book New Appointment</button>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Appt #</th>
                <th>Patient Details</th>
                <th>Doctor & Department</th>
                <th>Scheduled Date & Time</th>
                <th>Chief Complaint / Reason</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${appointments.map(a => `
                <tr>
                  <td><strong>#${a.Appointment_ID}</strong></td>
                  <td>
                    <div class="fw-bold">${a.Patient_Name}</div>
                    <small class="text-muted">${a.Patient_Phone} | Blood: ${a.Blood_Group}</small>
                  </td>
                  <td>
                    <div>${a.Doctor_Name}</div>
                    <small class="text-muted">${a.Specialization} (Room ${a.Room_Number})</small>
                  </td>
                  <td>
                    <div>${formatDate(a.Appointment_Date)}</div>
                    <small class="text-primary fw-semibold">${a.Appointment_Time.slice(0, 5)}</small>
                  </td>
                  <td><small>${a.Reason}</small></td>
                  <td>
                    <span class="badge-custom ${a.Status === 'Completed' ? 'badge-success-soft' : a.Status === 'Cancelled' ? 'badge-danger-soft' : 'badge-primary-soft'}">
                      ${a.Status}
                    </span>
                  </td>
                  <td class="text-end">
                    ${a.Status === 'Scheduled' ? `
                      <button class="btn btn-sm btn-outline-success" onclick="updateApptStatus(${a.Appointment_ID}, 'Completed')" title="Mark Completed">
                        <i class="bi bi-check-lg"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" onclick="updateApptStatus(${a.Appointment_ID}, 'Cancelled')" title="Cancel">
                        <i class="bi bi-x-lg"></i>
                      </button>
                    ` : '<span class="text-muted small">Finalized</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function updateApptStatus(appointmentId, status) {
  const res = await fetchAPI(`/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  if (res.success) {
    showToast(`Appointment marked as ${status}.`, 'success');
    loadAppointments();
  }
}

// -------------------------------------------------------------
// VIEW 4: INPATIENT ADMISSIONS & BED MANAGEMENT
// -------------------------------------------------------------
async function loadAdmissions() {
  const [boardRes, admRes] = await Promise.all([
    fetchAPI('/beds/board'),
    fetchAPI('/admissions')
  ]);

  const board = boardRes.success ? boardRes.data : [];
  const admissions = admRes.success ? admRes.data : [];

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Live Interactive Bed Grid -->
      <div class="content-card mb-4">
        <div class="card-header-custom flex-wrap gap-2">
          <h5><i class="bi bi-hospital text-danger"></i> Live Ward & Bed Occupancy Grid</h5>
          <div class="d-flex align-items-center gap-3">
            <span class="small"><span class="badge bg-success me-1">&nbsp;</span> Available</span>
            <span class="small"><span class="badge bg-danger me-1">&nbsp;</span> Occupied</span>
            <button class="btn btn-sm btn-primary" onclick="openAdmissionModal()"><i class="bi bi-hospital me-1"></i> Admit Patient</button>
          </div>
        </div>
        <div class="p-3">
          <div class="row g-3">
            ${board.map(room => `
              <div class="col-lg-4 col-md-6">
                <div class="bed-room-card">
                  <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <strong>Room ${room.Room_Number}</strong>
                    <span class="badge bg-light text-dark border">${room.Room_Type} (₹${parseFloat(room.Daily_Rate)}/day)</span>
                  </div>
                  <div class="d-flex flex-column gap-2">
                    ${room.beds.map(bed => `
                      <div class="bed-chip ${bed.Status.toLowerCase()}">
                        <div>
                          <i class="bi bi-hdd-rack me-1"></i> <strong>${bed.Bed_Number}</strong>
                          ${bed.Patient_Name ? `<div class="small fw-semibold text-danger"><i class="bi bi-person me-1"></i>${bed.Patient_Name}</div>` : ''}
                        </div>
                        <span class="badge ${bed.Status === 'Available' ? 'bg-success' : 'bg-danger'}">${bed.Status}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Inpatient Admissions Table -->
      <div class="content-card">
        <div class="card-header-custom">
          <h5><i class="bi bi-journal-medical text-primary"></i> Inpatient Admissions List (${admissions.length})</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Adm #</th>
                <th>Patient Name</th>
                <th>Type</th>
                <th>Attending Doctor</th>
                <th>Room & Bed</th>
                <th>Admitted Date</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${admissions.map(adm => `
                <tr>
                  <td><strong>#${adm.Admission_ID}</strong></td>
                  <td>
                    <div class="fw-bold">${adm.Patient_Name}</div>
                    <small class="text-muted">${adm.Admission_Reason}</small>
                  </td>
                  <td><span class="badge ${adm.Admission_Type === 'Emergency' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}">${adm.Admission_Type}</span></td>
                  <td>${adm.Doctor_Name}</td>
                  <td>${adm.Room_Number ? `${adm.Room_Number} - ${adm.Bed_Number}` : '<span class="text-muted">Released</span>'}</td>
                  <td>${formatDate(adm.Admitted_Date)}</td>
                  <td><span class="badge-custom ${adm.Status === 'Admitted' ? 'badge-warning-soft' : 'badge-success-soft'}">${adm.Status}</span></td>
                  <td class="text-end">
                    ${adm.Status === 'Admitted' ? `
                      <button class="btn btn-sm btn-outline-danger" onclick="dischargePatientAction(${adm.Admission_ID})">
                        <i class="bi bi-box-arrow-right me-1"></i> Discharge
                      </button>
                    ` : `<small class="text-muted">Discharged ${formatDate(adm.Discharge_Date)}</small>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function dischargePatientAction(admissionId) {
  if (!confirm('Are you sure you want to discharge this patient and release the bed?')) return;
  const res = await fetchAPI(`/admissions/${admissionId}/discharge`, { method: 'POST' });
  if (res.success) {
    showToast('Patient discharged and bed released successfully.', 'success');
    preloadDropdownData();
    loadAdmissions();
  }
}

// -------------------------------------------------------------
// VIEW 5: ELECTRONIC HEALTH RECORDS & CLINICAL ENCOUNTERS
// -------------------------------------------------------------
async function loadRecords() {
  let endpoint = '/medical-records';
  if (currentUser && currentUser.role === 'Patient' && currentUser.patientId) {
    endpoint += `?patientId=${currentUser.patientId}`;
  } else if (currentUser && currentUser.role === 'Doctor' && currentUser.staffId) {
    endpoint += `?doctorId=${currentUser.staffId}`;
  }
  const res = await fetchAPI(endpoint);
  if (!res.success) return;
  const records = res.data;

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <div class="content-card">
        <div class="card-header-custom flex-wrap gap-2">
          <h5><i class="bi bi-journal-medical text-primary"></i> Clinical Encounters & Prescriptions (${records.length})</h5>
          <button class="btn btn-sm btn-primary" onclick="openMedicalRecordModal()"><i class="bi bi-journal-plus me-1"></i> Write Encounter Record</button>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Record #</th>
                <th>Patient Details</th>
                <th>Attending Doctor</th>
                <th>Encounter Date</th>
                <th>Symptoms & Clinical Findings</th>
                <th>Primary Diagnosis (ICD-10)</th>
                <th>Follow-up</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(r => `
                <tr>
                  <td><strong>#${r.Record_ID}</strong></td>
                  <td>
                    <div class="fw-bold">${r.Patient_Name}</div>
                    <small class="text-muted">DOB: ${formatDate(r.Date_Of_Birth)} | ${r.Blood_Group}</small>
                  </td>
                  <td>
                    <div>${r.Doctor_Name}</div>
                    <small class="text-muted">${r.Specialization}</small>
                  </td>
                  <td>${formatDate(r.Visit_Date)}</td>
                  <td>
                    <div>${r.Symptoms}</div>
                    ${r.Treatment_Notes ? `<small class="text-muted">Notes: ${r.Treatment_Notes}</small>` : ''}
                  </td>
                  <td><span class="badge bg-info-subtle text-info fw-semibold">${r.Diagnoses_List || 'Diagnosed'}</span></td>
                  <td>${r.Follow_Up_Date ? formatDate(r.Follow_Up_Date) : '<span class="text-muted">-</span>'}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewRecordDetails(${r.Record_ID})">
                      <i class="bi bi-file-earmark-medical"></i> View Rx
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function viewRecordDetails(recordId) {
  const res = await fetchAPI(`/medical-records/${recordId}`);
  if (!res.success) return;
  const r = res.data;

  const modalEl = document.getElementById('modal-patient-details');
  const bodyEl = document.getElementById('patient-details-body');
  
  bodyEl.innerHTML = `
    <div class="p-3 mb-3 bg-light rounded-3">
      <div class="d-flex justify-content-between">
        <div>
          <h5 class="fw-bold text-dark mb-1">Clinical Encounter Record #${r.Record_ID}</h5>
          <div class="text-muted small">Date: ${formatDate(r.Visit_Date)} | Patient: <strong>${r.Patient_Name}</strong> | Doctor: <strong>${r.Doctor_Name} (${r.Specialization})</strong></div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="p-3 border rounded-3">
          <h6 class="fw-bold text-secondary">Chief Symptoms & Presentation</h6>
          <p class="mb-0">${r.Symptoms}</p>
        </div>
      </div>
      <div class="col-md-6">
        <div class="p-3 border rounded-3">
          <h6 class="fw-bold text-secondary">Physical Examination</h6>
          <p class="mb-0">${r.Physical_Examination || 'None recorded'}</p>
        </div>
      </div>
      <div class="col-12">
        <div class="p-3 border rounded-3">
          <h6 class="fw-bold text-secondary">Treatment Notes & Plan</h6>
          <p class="mb-0">${r.Treatment_Notes || 'None recorded'}</p>
        </div>
      </div>
    </div>

    <h6 class="fw-bold text-primary mb-2"><i class="bi bi-capsule me-1"></i> Prescribed Medications (Rx)</h6>
    ${r.prescriptions.length === 0 ? '<p class="text-muted">No prescriptions written for this visit.</p>' : `
      <div class="table-responsive">
        <table class="table table-bordered table-sm">
          <thead class="table-light">
            <tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Quantity</th><th>Special Instructions</th></tr>
          </thead>
          <tbody>
            ${r.prescriptions.flatMap(rx => rx.items || []).map(item => `
              <tr>
                <td><strong>${item.Medicine_Name}</strong></td>
                <td>${item.Dosage}</td>
                <td>${item.Frequency}</td>
                <td>${item.Duration_Days} days</td>
                <td>${item.Quantity} units</td>
                <td>${item.Notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

// -------------------------------------------------------------
// VIEW 6: MEDICAL SPECIALISTS & CLINICAL STAFF
// -------------------------------------------------------------
async function loadDoctors() {
  const [docRes, nurseRes, staffRes] = await Promise.all([
    fetchAPI('/doctors'),
    fetchAPI('/nurses'),
    fetchAPI('/staff')
  ]);

  const doctors = docRes.success ? docRes.data : [];
  const nurses = nurseRes.success ? nurseRes.data : [];
  const staff = staffRes.success ? staffRes.data : [];

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Doctors Cards -->
      <div class="content-card mb-4">
        <div class="card-header-custom">
          <h5><i class="bi bi-person-badge text-primary"></i> Specialist Medical Doctors & Consultants</h5>
        </div>
        <div class="p-3">
          <div class="row g-3">
            ${doctors.map(d => `
              <div class="col-lg-4 col-md-6">
                <div class="p-3 border rounded-3 bg-white h-100 shadow-sm" style="border-top: 3px solid var(--primary) !important;">
                  <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="stat-icon primary" style="width: 48px; height: 48px; font-size: 22px;">
                      <i class="bi bi-person-badge"></i>
                    </div>
                    <div>
                      <h6 class="mb-0 fw-bold">Dr. ${d.First_Name} ${d.Last_Name}</h6>
                      <small class="text-primary fw-semibold">${d.Specialization}</small>
                    </div>
                  </div>
                  <div class="small text-muted mb-2"><i class="bi bi-building me-1"></i> Department: <strong>${d.Department_Name}</strong></div>
                  <div class="small text-muted mb-2"><i class="bi bi-mortarboard me-1"></i> Qualifications: ${d.Qualification}</div>
                  <div class="small text-muted mb-2"><i class="bi bi-geo-alt me-1"></i> Room: <strong>${d.Room_Number}</strong> | Fee: <strong>₹${parseFloat(d.Consultation_Fee)}</strong></div>
                  <div class="small text-muted mb-2"><i class="bi bi-card-checklist me-1"></i> License: ${d.License_Number}</div>
                  <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                    <span class="badge bg-success-subtle text-success">Active Practice</span>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewDoctorSchedules(${d.Doctor_ID})">
                      <i class="bi bi-calendar3"></i> Schedules
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Nurses & Nursing Staff -->
      <div class="content-card">
        <div class="card-header-custom">
          <h5><i class="bi bi-heart text-danger"></i> Registered Nursing & Care Staff</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Nurse ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Assigned Ward</th>
                <th>Shift</th>
                <th>Qualifications</th>
                <th>License</th>
              </tr>
            </thead>
            <tbody>
              ${nurses.map(n => `
                <tr>
                  <td>#${n.Nurse_ID}</td>
                  <td><strong>${n.First_Name} ${n.Last_Name}</strong></td>
                  <td>${n.Department_Name}</td>
                  <td><span class="badge bg-info-subtle text-info">${n.Assigned_Ward}</span></td>
                  <td><span class="badge bg-secondary-subtle text-secondary">${n.Shift}</span></td>
                  <td>${n.Qualification}</td>
                  <td><small class="text-muted">${n.License_Number}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function viewDoctorSchedules(doctorId) {
  const res = await fetchAPI(`/doctors/${doctorId}/schedules`);
  if (!res.success) return;
  const schedules = res.data;

  const modalEl = document.getElementById('modal-patient-details');
  const bodyEl = document.getElementById('patient-details-body');
  
  bodyEl.innerHTML = `
    <h5 class="fw-bold text-dark mb-3"><i class="bi bi-calendar3 text-primary me-2"></i> Weekly Consultation Roster</h5>
    ${schedules.length === 0 ? '<p class="text-muted">No scheduled time blocks found for this physician.</p>' : `
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr><th>Day of Week</th><th>Start Time</th><th>End Time</th><th>Max Appointments</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${schedules.map(s => `
              <tr>
                <td><strong>${s.Day_Of_Week}</strong></td>
                <td>${s.Start_Time.slice(0, 5)}</td>
                <td>${s.End_Time.slice(0, 5)}</td>
                <td>${s.Max_Appointments} patients</td>
                <td><span class="badge bg-success">${s.Status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

// -------------------------------------------------------------
// VIEW 7: CLINICAL & OPERATIONAL DEPARTMENTS
// -------------------------------------------------------------
async function loadDepartments() {
  const res = await fetchAPI('/departments');
  if (!res.success) return;
  const depts = res.data;

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <div class="row g-3">
        ${depts.map(d => `
          <div class="col-lg-4 col-md-6">
            <div class="content-card p-4 h-100">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="stat-icon primary">
                  <i class="bi bi-building"></i>
                </div>
                <div>
                  <h5 class="mb-0 fw-bold text-dark">${d.Department_Name}</h5>
                  <small class="text-muted">${d.Location}</small>
                </div>
              </div>
              <p class="text-muted small mb-3">${d.Description || 'Specialized clinical hospital unit.'}</p>
              <div class="d-flex justify-content-between align-items-center pt-3 border-top small text-muted">
                <div><i class="bi bi-person-fill me-1"></i> Head: <strong>${d.Head_Doctor_Name || 'Appointing'}</strong></div>
                <div><i class="bi bi-telephone-fill me-1"></i> ${d.Contact_Number}</div>
              </div>
              <div class="mt-2 text-primary small fw-semibold">
                ${d.Doctors_Count} Doctors | ${d.Total_Staff_Count} Total Staff
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// VIEW 8: PATHOLOGY & LABORATORY SERVICES
// -------------------------------------------------------------
async function loadLaboratory() {
  const [ordersRes, testsRes] = await Promise.all([
    fetchAPI('/lab/orders'),
    fetchAPI('/lab/tests')
  ]);

  const orders = ordersRes.success ? ordersRes.data : [];
  const tests = testsRes.success ? testsRes.data : [];

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Orders Queue -->
      <div class="content-card mb-4">
        <div class="card-header-custom flex-wrap gap-2">
          <h5><i class="bi bi-eyedropper text-primary"></i> Diagnostic Laboratory Orders (${orders.length})</h5>
          <button class="btn btn-sm btn-primary" onclick="openLabOrderModal()"><i class="bi bi-plus-lg me-1"></i> Order New Investigation</button>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Patient Details</th>
                <th>Test Name</th>
                <th>Priority</th>
                <th>Ordering Doctor</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Diagnostic Findings</th>
                <th class="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td><strong>#${o.Order_ID}</strong></td>
                  <td>
                    <div class="fw-bold">${o.Patient_Name}</div>
                    <small class="text-muted">${o.Patient_Phone}</small>
                  </td>
                  <td>
                    <div class="fw-semibold">${o.Test_Name}</div>
                    <small class="text-muted">${o.Test_Category} (₹${parseFloat(o.Cost)})</small>
                  </td>
                  <td><span class="badge ${o.Priority === 'STAT' ? 'bg-danger' : o.Priority === 'Urgent' ? 'bg-warning text-dark' : 'bg-secondary'}">${o.Priority}</span></td>
                  <td>${o.Doctor_Name}</td>
                  <td>${formatDate(o.Order_Date)}</td>
                  <td><span class="badge-custom ${o.Status === 'Completed' ? 'badge-success-soft' : 'badge-warning-soft'}">${o.Status}</span></td>
                  <td>
                    ${o.Result_Value ? `
                      <span class="badge ${o.Report_Status === 'Critical' ? 'bg-danger' : o.Report_Status === 'Abnormal' ? 'bg-warning text-dark' : 'bg-success'}">${o.Report_Status}</span>
                      <small class="d-block text-truncate" style="max-width: 180px;">${o.Result_Value}</small>
                    ` : '<span class="text-muted small">Pending analysis</span>'}
                  </td>
                  <td class="text-end">
                    ${o.Status !== 'Completed' ? `
                      <button class="btn btn-sm btn-primary" onclick="openUploadReportModal(${o.Order_ID})">
                        <i class="bi bi-upload me-1"></i> Enter Results
                      </button>
                    ` : '<span class="text-muted small">Report Signed</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Test Catalog -->
      <div class="content-card">
        <div class="card-header-custom">
          <h5><i class="bi bi-card-checklist text-secondary"></i> Hospital Diagnostic Tests Catalog (${tests.length})</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Test Name</th>
                <th>Category</th>
                <th>Standard Charge</th>
                <th>Normal Reference Range</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${tests.map(t => `
                <tr>
                  <td>#${t.Test_ID}</td>
                  <td><strong>${t.Test_Name}</strong></td>
                  <td><span class="badge bg-light text-dark border">${t.Category}</span></td>
                  <td><strong>₹${parseFloat(t.Cost).toLocaleString('en-IN')}</strong></td>
                  <td><code>${t.Normal_Range || 'N/A'}</code></td>
                  <td><small class="text-muted">${t.Description || ''}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openUploadReportModal(orderId) {
  document.getElementById('lr-order-id').value = orderId;
  const modalEl = document.getElementById('modal-lab-report');
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function handleLabReportSubmit(e) {
  e.preventDefault();
  const orderId = document.getElementById('lr-order-id').value;
  const conductedBy = document.getElementById('lr-tech').value;
  const resultValue = document.getElementById('lr-value').value.trim();
  const status = document.getElementById('lr-status').value;
  const comments = document.getElementById('lr-comments').value.trim();

  const res = await fetchAPI('/lab/reports', {
    method: 'POST',
    body: JSON.stringify({ orderId, conductedBy, resultValue, status, comments })
  });

  if (res.success) {
    showToast('Lab report uploaded and order finalized.', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modal-lab-report')).hide();
    loadLaboratory();
  }
}

// -------------------------------------------------------------
// VIEW 9: PHARMACEUTICAL DISPENSARY & INVENTORY
// -------------------------------------------------------------
async function loadPharmacy() {
  const [medsRes, batchesRes, suppRes] = await Promise.all([
    fetchAPI('/pharmacy/medicines'),
    fetchAPI('/pharmacy/batches'),
    fetchAPI('/pharmacy/suppliers')
  ]);

  const medicines = medsRes.success ? medsRes.data : [];
  const batches = batchesRes.success ? batchesRes.data : [];
  const suppliers = suppRes.success ? suppRes.data : [];

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Medicines Stock -->
      <div class="content-card mb-4">
        <div class="card-header-custom flex-wrap gap-2">
          <h5><i class="bi bi-capsule text-primary"></i> Pharmacy Medicine Inventory (${medicines.length})</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Med #</th>
                <th>Medicine Name</th>
                <th>Generic Formulation</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Manufacturer</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              ${medicines.map(m => `
                <tr>
                  <td><strong>#${m.Medicine_ID}</strong></td>
                  <td><strong>${m.Medicine_Name}</strong></td>
                  <td><small class="text-muted">${m.Generic_Name || '-'}</small></td>
                  <td><span class="badge bg-light text-dark border">${m.Category}</span></td>
                  <td>₹${parseFloat(m.Unit_Price).toFixed(2)}</td>
                  <td><strong class="fs-6">${m.Stock_Quantity}</strong> units</td>
                  <td>${m.Reorder_Level}</td>
                  <td><small class="text-muted">${m.Manufacturer}</small></td>
                  <td>
                    ${m.Is_Low_Stock ? `
                      <span class="badge bg-danger-subtle text-danger fw-bold"><i class="bi bi-exclamation-triangle-fill me-1"></i> Low Stock</span>
                    ` : `
                      <span class="badge bg-success-subtle text-success">Healthy</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Batches & Expiry Tracker -->
      <div class="content-card">
        <div class="card-header-custom">
          <h5><i class="bi bi-clock-history text-warning"></i> Medicine Batches & Expiration Surveillance</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Medicine</th>
                <th>Manufacturing Date</th>
                <th>Expiry Date</th>
                <th>Units Remaining</th>
                <th>Days to Expiry</th>
                <th>Safety Status</th>
              </tr>
            </thead>
            <tbody>
              ${batches.map(b => `
                <tr>
                  <td><code>${b.Batch_Number}</code></td>
                  <td><strong>${b.Medicine_Name}</strong></td>
                  <td>${formatDate(b.Manufacturing_Date)}</td>
                  <td>${formatDate(b.Expiry_Date)}</td>
                  <td>${b.Quantity} units</td>
                  <td><strong>${b.Days_Until_Expiry} days</strong></td>
                  <td>
                    ${b.Days_Until_Expiry < 90 ? `
                      <span class="badge bg-danger">Critical Expiry</span>
                    ` : `
                      <span class="badge bg-success">Valid Stock</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// VIEW 10: BILLING, PATIENT INVOICES & CLAIMS
// -------------------------------------------------------------
async function loadBilling() {
  let billsEndpoint = '/billing/bills';
  if (currentUser && currentUser.role === 'Patient' && currentUser.patientId) {
    billsEndpoint += `?patientId=${currentUser.patientId}`;
  }
  const [billsRes, claimsRes] = await Promise.all([
    fetchAPI(billsEndpoint),
    fetchAPI('/billing/claims')
  ]);

  const bills = billsRes.success ? billsRes.data : [];
  const claims = claimsRes.success ? claimsRes.data : [];

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Bills Invoices -->
      <div class="content-card mb-4">
        <div class="card-header-custom">
          <h5><i class="bi bi-receipt-cutoff text-primary"></i> Patient Invoices & Collections (${bills.length})</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Patient Name</th>
                <th>Invoice Date</th>
                <th>Total Bill</th>
                <th>Discount</th>
                <th>Net Payable</th>
                <th>Amount Paid</th>
                <th>Payment Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bills.map(b => `
                <tr>
                  <td><strong>#${b.Bill_ID}</strong></td>
                  <td>
                    <div class="fw-bold">${b.Patient_Name}</div>
                    <small class="text-muted">${b.Patient_Phone}</small>
                  </td>
                  <td>${formatDate(b.Bill_Date)}</td>
                  <td>₹${parseFloat(b.Total_Amount).toLocaleString('en-IN')}</td>
                  <td>₹${parseFloat(b.Discount_Amount).toLocaleString('en-IN')}</td>
                  <td><strong>₹${parseFloat(b.Net_Amount).toLocaleString('en-IN')}</strong></td>
                  <td class="text-success">₹${parseFloat(b.Paid_Amount).toLocaleString('en-IN')}</td>
                  <td>
                    <span class="badge-custom ${b.Payment_Status === 'Paid' ? 'badge-success-soft' : b.Payment_Status === 'Partially Paid' ? 'badge-warning-soft' : 'badge-danger-soft'}">
                      ${b.Payment_Status}
                    </span>
                  </td>
                  <td class="text-end">
                    ${b.Payment_Status !== 'Paid' ? `
                      <button class="btn btn-sm btn-success me-1" onclick="openPaymentModal(${b.Bill_ID}, ${b.Net_Amount - b.Paid_Amount}, '${b.Patient_Name}')">
                        <i class="bi bi-credit-card me-1"></i> Pay
                      </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-primary" onclick="viewBillDetails(${b.Bill_ID})">
                      <i class="bi bi-file-text"></i> Invoice
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Insurance Claims -->
      <div class="content-card">
        <div class="card-header-custom">
          <h5><i class="bi bi-shield-check text-success"></i> Health Insurance Claims & TPA Approvals</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Insurance Provider</th>
                <th>Policy Number</th>
                <th>Patient</th>
                <th>Claimed Amount</th>
                <th>Approved Amount</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${claims.map(c => `
                <tr>
                  <td>#${c.Claim_ID}</td>
                  <td><strong>${c.Provider_Name}</strong></td>
                  <td><code>${c.Policy_Number}</code></td>
                  <td>${c.Patient_Name}</td>
                  <td>₹${parseFloat(c.Claimed_Amount).toLocaleString('en-IN')}</td>
                  <td class="text-success"><strong>₹${parseFloat(c.Approved_Amount).toLocaleString('en-IN')}</strong></td>
                  <td><span class="badge ${c.Claim_Status === 'Settled' ? 'bg-success' : c.Claim_Status === 'Approved' ? 'bg-primary' : 'bg-warning text-dark'}">${c.Claim_Status}</span></td>
                  <td><small class="text-muted">${c.Remarks || '-'}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openPaymentModal(billId, pendingAmount, patientName) {
  document.getElementById('pay-bill-id').value = billId;
  document.getElementById('pay-amount').value = Math.max(0, pendingAmount);
  document.getElementById('pay-bill-info').innerHTML = `Processing payment for <strong>${patientName}</strong> (Invoice #${billId}). Remaining balance: <strong>₹${pendingAmount.toLocaleString('en-IN')}</strong>`;
  const modalEl = document.getElementById('modal-payment');
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function handlePaymentSubmit(e) {
  e.preventDefault();
  const billId = document.getElementById('pay-bill-id').value;
  const amount = document.getElementById('pay-amount').value;
  const paymentMethod = document.getElementById('pay-method').value;
  const transactionReference = document.getElementById('pay-ref').value.trim() || `TXN-${Date.now()}`;

  const res = await fetchAPI('/billing/payments', {
    method: 'POST',
    body: JSON.stringify({ billId, amount, paymentMethod, transactionReference })
  });

  if (res.success) {
    showToast(`Payment of ₹${amount} completed. Bill is now ${res.billStatus}.`, 'success');
    bootstrap.Modal.getInstance(document.getElementById('modal-payment')).hide();
    loadBilling();
  }
}

async function viewBillDetails(billId) {
  const res = await fetchAPI(`/billing/bills/${billId}`);
  if (!res.success) return;
  const b = res.data;

  const modalEl = document.getElementById('modal-patient-details');
  const bodyEl = document.getElementById('patient-details-body');

  bodyEl.innerHTML = `
    <div class="p-4 border rounded-3 bg-white">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h4 class="fw-bold text-primary mb-0">MediTrack Hospital</h4>
          <div class="text-muted small">Tax Invoice & Clinical Bill #${b.Bill_ID}</div>
        </div>
        <div class="text-end">
          <div class="badge-custom ${b.Payment_Status === 'Paid' ? 'badge-success-soft' : 'badge-warning-soft'} fs-6">${b.Payment_Status}</div>
          <div class="text-muted small mt-1">Date: ${formatDate(b.Bill_Date)}</div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-6">
          <h6 class="fw-bold text-secondary">Billed To:</h6>
          <div><strong>${b.Patient_Name}</strong></div>
          <div class="text-muted small">${b.Patient_Phone}</div>
          <div class="text-muted small">${b.Address || ''}</div>
        </div>
      </div>

      <h6 class="fw-bold text-secondary">Itemized Services & Charges</h6>
      <div class="table-responsive mb-4">
        <table class="table table-bordered">
          <thead class="table-light">
            <tr><th>Type</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total Price</th></tr>
          </thead>
          <tbody>
            ${(b.items || []).map(item => `
              <tr>
                <td><span class="badge bg-light text-dark border">${item.Item_Type}</span></td>
                <td>${item.Description}</td>
                <td>${item.Quantity}</td>
                <td>₹${parseFloat(item.Unit_Price).toFixed(2)}</td>
                <td><strong>₹${parseFloat(item.Total_Price).toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-end fw-bold">Total Amount:</td>
              <td class="fw-bold">₹${parseFloat(b.Total_Amount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="4" class="text-end">Discount Applied:</td>
              <td class="text-danger">-₹${parseFloat(b.Discount_Amount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="4" class="text-end">Tax / GST:</td>
              <td>+₹${parseFloat(b.Tax_Amount).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="table-primary">
              <td colspan="4" class="text-end fw-bold fs-6">Net Payable Amount:</td>
              <td class="fw-bold fs-6">₹${parseFloat(b.Net_Amount).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="4" class="text-end fw-bold text-success">Total Amount Paid:</td>
              <td class="fw-bold text-success">₹${parseFloat(b.Paid_Amount).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      ${b.payments && b.payments.length > 0 ? `
        <h6 class="fw-bold text-secondary">Recorded Transaction Receipts</h6>
        <ul class="list-group list-group-flush mb-3">
          ${b.payments.map(pay => `
            <li class="list-group-item d-flex justify-content-between align-items-center px-0">
              <div>
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                <strong>${pay.Payment_Method}</strong> (Ref: <code>${pay.Transaction_Reference}</code>)
              </div>
              <div>
                <strong>₹${parseFloat(pay.Amount).toLocaleString('en-IN')}</strong>
                <small class="text-muted ms-2">${formatDate(pay.Payment_Date)}</small>
              </div>
            </li>
          `).join('')}
        </ul>
      ` : ''}
    </div>
  `;

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

// -------------------------------------------------------------
// VIEW 11: ACCESS CONTROL & AUDIT LOGS
// -------------------------------------------------------------
async function loadAudit() {
  const [logsRes, usersRes] = await Promise.all([
    fetchAPI('/audit-logs'),
    fetchAPI('/users')
  ]);

  const logs = logsRes.success ? logsRes.data : [];
  const users = usersRes.success ? usersRes.data : [];

  const contentArea = document.getElementById('dynamic-content');
  contentArea.innerHTML = `
    <div class="view-section">
      <!-- Users Table -->
      <div class="content-card mb-4">
        <div class="card-header-custom">
          <h5><i class="bi bi-people text-primary"></i> Authorized Hospital User Accounts</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Role (RBAC)</th>
                <th>Associated Person</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Account Created</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>#${u.User_ID}</td>
                  <td><strong>${u.Username}</strong></td>
                  <td><span class="badge bg-primary-subtle text-primary fw-bold">${u.Role}</span></td>
                  <td>${u.Staff_First_Name ? `${u.Staff_First_Name} ${u.Staff_Last_Name} (Staff)` : u.Patient_First_Name ? `${u.Patient_First_Name} ${u.Patient_Last_Name} (Patient)` : '<span class="text-muted">System</span>'}</td>
                  <td><span class="badge bg-success-subtle text-success">${u.Status}</span></td>
                  <td>${u.Last_Login ? formatDate(u.Last_Login) : '<span class="text-muted">Never</span>'}</td>
                  <td>${formatDate(u.Created_At)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="content-card">
        <div class="card-header-custom">
          <h5><i class="bi bi-shield-lock text-danger"></i> Compliance & Security Audit Logs</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>Log #</th>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity Affected</th>
                <th>Entity ID</th>
                <th>Triggered By</th>
                <th>IP Address</th>
                <th>Payload Change Details</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td>#${l.Log_ID}</td>
                  <td><small class="text-muted">${formatDate(l.Timestamp)}</small></td>
                  <td><span class="badge bg-dark">${l.Action}</span></td>
                  <td><code>${l.Entity_Name}</code></td>
                  <td>#${l.Entity_ID || '-'}</td>
                  <td><strong>${l.Username || 'System'}</strong></td>
                  <td><small class="text-muted">${l.IP_Address || '127.0.0.1'}</small></td>
                  <td>
                    <small class="text-truncate d-block" style="max-width: 250px;" title='${JSON.stringify(l.New_Values)}'>
                      ${JSON.stringify(l.New_Values || l.Old_Values || {})}
                    </small>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// MODAL OPENERS & FORM HANDLERS
// -------------------------------------------------------------
function openPatientModal() {
  document.getElementById('form-patient').reset();
  const modalEl = document.getElementById('modal-patient');
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function handlePatientSubmit(e) {
  e.preventDefault();
  const payload = {
    firstName: document.getElementById('p-first-name').value.trim(),
    lastName: document.getElementById('p-last-name').value.trim(),
    dateOfBirth: document.getElementById('p-dob').value,
    gender: document.getElementById('p-gender').value,
    bloodGroup: document.getElementById('p-blood').value,
    phone: document.getElementById('p-phone').value.trim(),
    email: document.getElementById('p-email').value.trim(),
    address: document.getElementById('p-address').value.trim(),
    emergencyContactName: document.getElementById('p-ec-name').value.trim(),
    emergencyContactPhone: document.getElementById('p-ec-phone').value.trim(),
    relationship: document.getElementById('p-ec-rel').value.trim(),
    initialCondition: document.getElementById('p-condition').value.trim(),
    knownAllergen: document.getElementById('p-allergen').value.trim()
  };

  const res = await fetchAPI('/patients', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res.success) {
    showToast('Patient registered successfully with clinical history & emergency contact!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modal-patient')).hide();
    preloadDropdownData();
    navigate('patients');
  } else {
    showToast(res.message || 'Error creating patient', 'danger');
  }
}

function openAppointmentModal() {
  document.getElementById('form-appointment').reset();
  
  // Populate dropdowns
  const patientSelect = document.getElementById('appt-patient');
  patientSelect.innerHTML = patientsCache.map(p => `<option value="${p.Patient_ID}">${p.First_Name} ${p.Last_Name} (${p.Phone})</option>`).join('');

  if (currentUser && currentUser.role === 'Patient' && currentUser.patientId) {
    patientSelect.value = currentUser.patientId;
    patientSelect.disabled = true;
  } else {
    patientSelect.disabled = false;
  }

  const doctorSelect = document.getElementById('appt-doctor');
  doctorSelect.innerHTML = doctorsCache.map(d => `<option value="${d.Doctor_ID}">Dr. ${d.First_Name} ${d.Last_Name} (${d.Specialization})</option>`).join('');

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('appt-date').value = today;

  const modalEl = document.getElementById('modal-appointment');
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function handleAppointmentSubmit(e) {
  e.preventDefault();
  const patientSelect = document.getElementById('appt-patient');
  const patientIdVal = (currentUser && currentUser.role === 'Patient' && currentUser.patientId)
    ? currentUser.patientId
    : patientSelect.value;

  const payload = {
    patientId: patientIdVal,
    doctorId: document.getElementById('appt-doctor').value,
    appointmentDate: document.getElementById('appt-date').value,
    appointmentTime: document.getElementById('appt-time').value,
    reason: document.getElementById('appt-reason').value.trim()
  };

  const res = await fetchAPI('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res.success) {
    showToast('Appointment booked successfully!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modal-appointment')).hide();
    navigate('appointments');
  } else {
    showToast(res.message || 'Error booking appointment', 'danger');
  }
}

function openAdmissionModal() {
  document.getElementById('form-admission').reset();

  const patientSelect = document.getElementById('adm-patient');
  patientSelect.innerHTML = patientsCache.map(p => `<option value="${p.Patient_ID}">${p.First_Name} ${p.Last_Name} (${p.Phone})</option>`).join('');

  const doctorSelect = document.getElementById('adm-doctor');
  doctorSelect.innerHTML = doctorsCache.map(d => `<option value="${d.Doctor_ID}">Dr. ${d.First_Name} ${d.Last_Name} (${d.Specialization})</option>`).join('');

  const bedSelect = document.getElementById('adm-bed');
  bedSelect.innerHTML = bedsCache.map(b => `<option value="${b.Bed_ID}">${b.Room_Number} - ${b.Bed_Number} (${b.Room_Type})</option>`).join('');

  const modalEl = document.getElementById('modal-admission');
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function handleAdmissionSubmit(e) {
  e.preventDefault();
  const payload = {
    patientId: document.getElementById('adm-patient').value,
    attendingDoctorId: document.getElementById('adm-doctor').value,
    admissionType: document.getElementById('adm-type').value,
    bedId: document.getElementById('adm-bed').value,
    admissionReason: document.getElementById('adm-reason').value.trim()
  };

  const res = await fetchAPI('/admissions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res.success) {
    showToast('Patient admitted and bed allocated!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modal-admission')).hide();
    preloadDropdownData();
    navigate('admissions');
  } else {
    showToast(res.message || 'Error admitting patient', 'danger');
  }
}

function openMedicalRecordModal() {
  document.getElementById('form-medical-record').reset();

  const patientSelect = document.getElementById('mr-patient');
  patientSelect.innerHTML = patientsCache.map(p => `<option value="${p.Patient_ID}">${p.First_Name} ${p.Last_Name} (${p.Phone})</option>`).join('');

  const doctorSelect = document.getElementById('mr-doctor');
  doctorSelect.innerHTML = doctorsCache.map(d => `<option value="${d.Doctor_ID}">Dr. ${d.First_Name} ${d.Last_Name} (${d.Specialization})</option>`).join('');

  const diagSelect = document.getElementById('mr-diagnosis');
  diagSelect.innerHTML = diagnosesCache.map(d => `<option value="${d.Diagnosis_ID}">${d.ICD_Code} - ${d.Diagnosis_Name} (${d.Category})</option>`).join('');

  const medSelect = document.getElementById('rx-medicine');
  medSelect.innerHTML = medicinesCache.map(m => `<option value="${m.Medicine_ID}">${m.Medicine_Name} (${m.Category})</option>`).join('');

  const modalEl = document.getElementById('modal-medical-record');
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function handleMedicalRecordSubmit(e) {
  e.preventDefault();
  const payload = {
    patientId: document.getElementById('mr-patient').value,
    doctorId: document.getElementById('mr-doctor').value,
    symptoms: document.getElementById('mr-symptoms').value.trim(),
    physicalExamination: document.getElementById('mr-exam').value.trim(),
    treatmentNotes: document.getElementById('mr-notes').value.trim(),
    followUpDate: document.getElementById('mr-followup').value || null,
    diagnosisIds: [document.getElementById('mr-diagnosis').value],
    prescriptionInstructions: document.getElementById('rx-instructions').value.trim() || 'Take medication as directed.',
    prescriptionItems: [{
      medicineId: document.getElementById('rx-medicine').value,
      dosage: document.getElementById('rx-dosage').value.trim() || 'Standard Dose',
      frequency: document.getElementById('rx-frequency').value.trim() || 'Once daily',
      durationDays: parseInt(document.getElementById('rx-days').value, 10) || 7,
      quantity: (parseInt(document.getElementById('rx-days').value, 10) || 7) * 2
    }]
  };

  const res = await fetchAPI('/medical-records', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res.success) {
    showToast('Clinical encounter & prescription recorded!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modal-medical-record')).hide();
    navigate('records');
  } else {
    showToast(res.message || 'Error recording encounter', 'danger');
  }
}

function openLabOrderModal() {
  document.getElementById('form-lab-order').reset();

  const patientSelect = document.getElementById('lo-patient');
  patientSelect.innerHTML = patientsCache.map(p => `<option value="${p.Patient_ID}">${p.First_Name} ${p.Last_Name} (${p.Phone})</option>`).join('');

  const doctorSelect = document.getElementById('lo-doctor');
  doctorSelect.innerHTML = doctorsCache.map(d => `<option value="${d.Doctor_ID}">Dr. ${d.First_Name} ${d.Last_Name} (${d.Specialization})</option>`).join('');

  const testSelect = document.getElementById('lo-test');
  testSelect.innerHTML = labTestsCache.map(t => `<option value="${t.Test_ID}">${t.Test_Name} (₹${parseFloat(t.Cost)})</option>`).join('');

  const modalEl = document.getElementById('modal-lab-order');
  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function handleLabOrderSubmit(e) {
  e.preventDefault();
  const payload = {
    patientId: document.getElementById('lo-patient').value,
    doctorId: document.getElementById('lo-doctor').value,
    testId: document.getElementById('lo-test').value,
    priority: document.getElementById('lo-priority').value
  };

  const res = await fetchAPI('/lab/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (res.success) {
    showToast('Lab test order placed successfully!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modal-lab-order')).hide();
    navigate('laboratory');
  } else {
    showToast(res.message || 'Error placing lab order', 'danger');
  }
}

// -------------------------------------------------------------
// UTILITIES
// -------------------------------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
