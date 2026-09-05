// ============================================
// ACABA 2#0 - Script Principal avec Supabase
// ============================================

// Configuration Supabase
const SUPABASE_URL = 'https://gajleiddneqwzbrzahgh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SO6dPdPS8DQzQ3tkx6FXsg_ctWy8X_U'; // ⚠️ REMPLACEZ PAR VOTRE CLÉ
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variables globales
let currentLang = localStorage.getItem('acaba_lang') || 'fr';
let matchSortOrder = 'asc';
let appData = {
    members: [], contributions: [], expenses: [], sanctions: [],
    referees: [], matches: [], injuries: [],
    officialDocs: { statut: "", reglement: "" },
    settings: { name: "ACABA 2#0", logo: "" }
};
let contribChartInstance = null;
let categoryChartInstance = null;

// Dictionnaire de traduction (version simplifiée)
const translations = {
    "dashboard": { fr: "Tableau de Bord", en: "Dashboard" },
    "members": { fr: "Membres", en: "Members" },
    "contributions": { fr: "Contributions", en: "Contributions" },
    "expenses": { fr: "Dépenses", en: "Expenses" },
    "bureau": { fr: "Bureau Exécutif", en: "Executive Board" },
    "sanctions": { fr: "Sanctions & Arbitres", en: "Sanctions & Referees" },
    "licences": { fr: "Licences", en: "Licenses" },
    "infirmerie": { fr: "Infirmerie", en: "Infirmary" },
    "teams": { fr: "Équipes & Matchs", en: "Teams & Matches" },
    "member-statement": { fr: "Relevé Membre", en: "Member Statement" },
    "annual-report": { fr: "Bilan Annuel", en: "Annual Report" },
    "official-docs": { fr: "Statut & Règlement", en: "Rules & Regulations" },
    "share-app": { fr: "Partager", en: "Share" },
    "settings": { fr: "Paramètres", en: "Settings" },
    "active_members": { fr: "Membres actifs", en: "Active Members" },
    "cfa_collected": { fr: "CFA collectés", en: "CFA Collected" },
    "matches_played": { fr: "Matchs joués", en: "Matches Played" },
    "next_match": { fr: "Prochain match", en: "Next Match" },
    "new_member": { fr: "Nouveau Membre", en: "New Member" },
    "save": { fr: "Enregistrer", en: "Save" },
    "cancel": { fr: "Annuler", en: "Cancel" },
    "member_saved": { fr: "Membre enregistré !", en: "Member saved!" },
    "member_deleted": { fr: "Membre supprimé !", en: "Member deleted!" },
    "contribution_saved": { fr: "Contribution ajoutée !", en: "Contribution added!" },
    "expense_saved": { fr: "Dépense ajoutée !", en: "Expense added!" }
};

// ============================================
// FONCTIONS DE NAVIGATION
// ============================================
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);
    
    // Cacher tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Afficher l'onglet cible
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    } else {
        console.error('Tab not found:', tabId);
    }
    
    // Mettre à jour le menu actif
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Fermer le menu mobile
    if (window.innerWidth <= 1023) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }
    
    // Rafraîchir les données spécifiques
    setTimeout(() => {
        if (tabId === 'dashboard') renderDashboard();
        if (tabId === 'members') renderMembersTable();
        if (tabId === 'contributions') renderContributions();
        if (tabId === 'expenses') renderExpenses();
        if (tabId === 'bureau') renderBureau();
        if (tabId === 'sanctions') { renderSanctions(); renderArbitres(); }
        if (tabId === 'licences') { populateMemberSelects(); }
        if (tabId === 'infirmerie') renderInfirmerie();
        if (tabId === 'teams') { renderTeams(); renderMatches(); }
        if (tabId === 'member-statement') { populateMemberSelects(); renderMemberStatement(); }
        if (tabId === 'annual-report') renderAnnualReport();
        if (tabId === 'official-docs') renderOfficialDocs();
    }, 100);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================
async function loadData() {
    console.log('Loading data from Supabase...');
    showToast('Chargement...', false);
    
    try {
        // Charger toutes les tables en parallèle
        const [
            { data: members, error: errM },
            { data: contributions, error: errC },
            { data: expenses, error: errE },
            { data: sanctions, error: errS },
            { data: referees, error: errR },
            { data: matches, error: errMatch },
            { data: injuries, error: errI },
            { data: params, error: errP }
        ] = await Promise.all([
            supabase.from('membres').select('*'),
            supabase.from('contributions').select('*'),
            supabase.from('depenses').select('*'),
            supabase.from('sanctions').select('*'),
            supabase.from('arbitres').select('*'),
            supabase.from('matchs').select('*'),
            supabase.from('blessures').select('*'),
            supabase.from('parametres').select('*')
        ]);

        if (errM) console.error('Erreur membres:', errM);
        if (errC) console.error('Erreur contributions:', errC);

        // Mapper les données
        appData.members = (members || []).map(m => ({
            id: m.id,
            lastName: m.nom,
            firstName: m.prenom,
            dob: m.date_naissance,
            pob: m.lieu_naissance,
            gender: m.sexe,
            civilStatus: m.situation,
            profession: m.profession,
            fonction: m.fonction_bureau,
            category: m.categorie,
            statutAdhesion: m.statut_adhesion,
            team: m.equipe,
            isCaptain: m.capitaine,
            position: m.poste,
            number: m.numero,
            phone: m.tel,
            email: m.email,
            address: m.adresse,
            photo: m.photo_url,
            status: m.statut_membre
        }));

        appData.contributions = (contributions || []).map(c => ({
            id: c.id,
            memberId: c.membre_id,
            amount: c.montant,
            date: c.date_paiement,
            type: c.type_paiement
        }));

        appData.expenses = (expenses || []).map(e => ({
            id: e.id,
            amount: e.montant,
            date: e.date_depense,
            reason: e.motif,
            beneficiary: e.beneficiaire
        }));

        appData.sanctions = (sanctions || []).map(s => ({
            id: s.id,
            memberId: s.joueur_id,
            type: s.type_sanction,
            amount: s.montant,
            amountPaid: s.montant_paye || 0,
            date: s.date_sanction,
            reason: s.motif
        }));

        appData.referees = (referees || []).map(r => ({
            id: r.id,
            name: r.nom,
            phone: r.tel,
            email: r.email,
            photo: r.photo_url
        }));

        appData.matches = (matches || []).map(m => ({
            id: m.id,
            type: m.type_match,
            date: m.date_match,
            trimester: m.trimestre,
            opponent: m.adversaire,
            score1: m.score1,
            score2: m.score2,
            manOfMatch: m.homme_match_id,
            refereeCentral: m.arbitre_central,
            commissioner: m.commissaire,
            judge1: m.juge1,
            judge2: m.juge2,
            scorers: m.buteurs,
            assists: m.passeurs,
            sheet1: m.feuille_match1,
            sheet2: m.feuille_match2
        }));

        appData.injuries = (injuries || []).map(i => ({
            id: i.id,
            memberId: i.joueur_id,
            type: i.type_blessure,
            duration: i.duree_jours,
            date: i.date_blessure,
            status: i.statut
        }));

        // Paramètres
        if (params) {
            params.forEach(p => {
                if (p.cle === 'statut') appData.officialDocs.statut = p.valeur;
                if (p.cle === 'reglement') appData.officialDocs.reglement = p.valeur;
                if (p.cle === 'nom_association') appData.settings.name = p.valeur;
                if (p.cle === 'logo_url') appData.settings.logo = p.valeur;
            });
        }

        console.log('Data loaded:', appData.members.length, 'members');
        showToast(`${appData.members.length} membres chargés`, false);
        
        // Afficher toutes les données
        renderAll();
        
    } catch (error) {
        console.error('Erreur loadData:', error);
        showToast('Erreur: ' + error.message, true);
    }
}

// ============================================
// FONCTIONS DE RENDU
// ============================================
function renderAll() {
    console.log('Rendering all...');
    renderDashboard();
    renderMembersTable();
    renderBureau();
    renderContributions();
    renderExpenses();
    renderSanctions();
    renderArbitres();
    renderTeams();
    renderMatches();
    renderInfirmerie();
    renderAnnualReport();
    renderOfficialDocs();
    populateMemberSelects();
}

function renderDashboard() {
    const el = (id) => document.getElementById(id);
    if (el('totalMembers')) el('totalMembers').innerText = appData.members.length;
    
    const totalCollected = appData.contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    if (el('totalCollected')) el('totalCollected').innerText = totalCollected.toLocaleString();
    if (el('totalMatches')) el('totalMatches').innerText = appData.matches.length;
    
    // Prochain match
    const today = new Date();
    const upcomingMatches = appData.matches
        .filter(m => new Date(m.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (el('nextMatchDate')) {
        if (upcomingMatches.length > 0) {
            el('nextMatchDate').innerText = new Date(upcomingMatches[0].date).toLocaleDateString('fr-FR');
        } else {
            el('nextMatchDate').innerText = '-';
        }
    }
}

function renderMembersTable() {
    const tbody = document.getElementById('membersTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (appData.members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Aucun membre</td></tr>';
        return;
    }
    
    appData.members.forEach(m => {
        const fullName = `${m.firstName} ${m.lastName}`;
        const avatar = m.photo 
            ? `<img src="${m.photo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">`
            : `<div style="width:40px; height:40px; border-radius:50%; background:var(--primary); color:var(--gold); display:flex; align-items:center; justify-content:center; font-weight:900;">${m.firstName.charAt(0)}${m.lastName.charAt(0)}</div>`;
        
        const statusBadge = m.status === 'Actif' 
            ? '<span class="badge badge-success">Actif</span>'
            : '<span class="badge badge-muted">Inactif</span>';
        
        const duesPaid = appData.contributions
            .filter(c => c.memberId === m.id && c.type === 'Cotisation Annuelle')
            .reduce((sum, c) => sum + Number(c.amount), 0);
        
        const duesBadge = duesPaid >= 25000 
            ? '<span class="badge badge-success">À jour</span>'
            : duesPaid >= 15000 
                ? '<span class="badge badge-warning">Partiel</span>'
                : '<span class="badge badge-danger">En retard</span>';
        
        tbody.innerHTML += `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${avatar}
                        <div>
                            <div style="font-weight:700;">${fullName}</div>
                            <div style="font-size:12px; color:var(--text-sec);">${m.profession || '-'}</div>
                        </div>
                    </div>
                </td>
                <td>${m.dob || '-'}</td>
                <td><span class="badge" style="background:var(--gold); color:var(--primary);">${m.team || 'A'}</span></td>
                <td>${duesBadge}<br><small>${duesPaid.toLocaleString()} F</small></td>
                <td>${statusBadge}</td>
                <td style="text-align:right;">
                    <button class="btn btn-sm btn-secondary" onclick="openMemberModal('${m.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMember('${m.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function renderBureau() {
    const container = document.getElementById('bureauContainer');
    if (!container) return;
    
    container.innerHTML = '';
    const boardMembers = appData.members.filter(m => m.fonction);
    
    if (boardMembers.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-sec);">Aucun membre du bureau</p>';
        return;
    }
    
    boardMembers.forEach(m => {
        const avatar = m.photo 
            ? `<img src="${m.photo}" style="width:80px; height:80px; border-radius:50%; object-fit:cover;">`
            : `<div style="width:80px; height:80px; border-radius:50%; background:var(--primary); color:var(--gold); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:28px;">${m.firstName.charAt(0)}${m.lastName.charAt(0)}</div>`;
        
        container.innerHTML += `
            <div class="org-card">
                <div class="org-card-content" style="text-align:center; padding:20px;">
                    ${avatar}
                    <h3 style="margin-top:15px; font-weight:800;">${m.firstName} ${m.lastName}</h3>
                    <div class="org-role-badge">${m.fonction}</div>
                    ${m.phone ? `<p><i class="fas fa-phone"></i> ${m.phone}</p>` : ''}
                    ${m.email ? `<p><i class="fas fa-envelope"></i> ${m.email}</p>` : ''}
                </div>
            </div>
        `;
    });
}

function renderContributions() {
    const tbody = document.getElementById('contribHistoryTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (appData.contributions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Aucune contribution</td></tr>';
        return;
    }
    
    appData.contributions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(c => {
        const member = appData.members.find(m => m.id === c.memberId);
        const memberName = member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
        
        tbody.innerHTML += `
            <tr>
                <td>${c.date}</td>
                <td>${memberName}</td>
                <td>${Number(c.amount).toLocaleString()} F</td>
                <td>${c.type}</td>
                <td style="text-align:right;">
                    <button class="btn btn-sm btn-danger" onclick="deleteContribution('${c.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function renderExpenses() {
    const tbody = document.getElementById('expensesTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let total = 0;
    
    appData.expenses.forEach(e => {
        total += Number(e.amount);
        tbody.innerHTML += `
            <tr>
                <td>${e.date}</td>
                <td>${e.reason}</td>
                <td>${e.beneficiary || '-'}</td>
                <td>${Number(e.amount).toLocaleString()} F</td>
                <td style="text-align:right;">
                    <button class="btn btn-sm btn-danger" onclick="deleteExpense('${e.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    
    const totalEl = document.getElementById('totalExpensesYear');
    if (totalEl) totalEl.innerText = total.toLocaleString();
}

function renderSanctions() {
    const tbody = document.getElementById('sanctionsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (appData.sanctions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Aucune sanction</td></tr>';
        return;
    }
    
    appData.sanctions.forEach(s => {
        const member = appData.members.find(m => m.id === s.memberId);
        const memberName = member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
        const remaining = Math.max(0, Number(s.amount) - Number(s.amountPaid));
        
        tbody.innerHTML += `
            <tr>
                <td>${memberName}</td>
                <td>${s.type}</td>
                <td>${Number(s.amount).toLocaleString()} F</td>
                <td>${Number(s.amountPaid).toLocaleString()} F</td>
                <td>${remaining.toLocaleString()} F</td>
                <td>${remaining === 0 ? '<span class="badge badge-success">Payé</span>' : '<span class="badge badge-danger">Impayé</span>'}</td>
                <td style="text-align:right;">
                    <button class="btn btn-sm btn-secondary" onclick="paySanction('${s.id}')"><i class="fas fa-money-check-dollar"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSanction('${s.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function renderArbitres() {
    const tbody = document.getElementById('arbitresTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (appData.referees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Aucun arbitre</td></tr>';
        return;
    }
    
    appData.referees.forEach(r => {
        tbody.innerHTML += `
            <tr>
                <td>${r.name}</td>
                <td>${r.phone || '-'}</td>
                <td>0</td>
                <td style="text-align:right;">
                    <button class="btn btn-sm btn-danger" onclick="deleteArbitre('${r.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function renderTeams() {
    const teamA = appData.members.filter(m => m.team === 'A').length;
    const teamB = appData.members.filter(m => m.team === 'B').length;
    
    const el = (id) => document.getElementById(id);
    if (el('teamACount')) el('teamACount').innerText = teamA;
    if (el('teamBCount')) el('teamBCount').innerText = teamB;
}

function renderMatches() {
    const hebdoTbody = document.getElementById('matchesHebdoTable');
    if (hebdoTbody) {
        hebdoTbody.innerHTML = '';
        const hebdoMatches = appData.matches.filter(m => m.type === 'hebdomadaire');
        
        if (hebdoMatches.length === 0) {
            hebdoTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Aucun match</td></tr>';
        } else {
            hebdoMatches.forEach(m => {
                hebdoTbody.innerHTML += `
                    <tr>
                        <td>${m.date}</td>
                        <td>${m.score1} - ${m.score2}</td>
                        <td>${m.scorers || '-'}</td>
                        <td>-</td>
                        <td style="text-align:right;">
                            <button class="btn btn-sm btn-danger" onclick="deleteMatch('${m.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
    }
}

function renderInfirmerie() {
    const tbody = document.getElementById('infirmerieTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (appData.injuries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Aucune blessure</td></tr>';
        return;
    }
    
    appData.injuries.forEach(b => {
        const member = appData.members.find(m => m.id === b.memberId);
        const memberName = member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
        
        tbody.innerHTML += `
            <tr>
                <td>${memberName}</td>
                <td>${b.type}</td>
                <td>${b.date}</td>
                <td>${b.duration} j</td>
                <td>-</td>
                <td>${b.status}</td>
                <td style="text-align:right;">
                    <button class="btn btn-sm btn-danger" onclick="deleteBlessure('${b.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function renderAnnualReport() {
    const totalRevenue = appData.contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const totalExpenses = appData.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const balance = totalRevenue - totalExpenses;
    
    const el = (id) => document.getElementById(id);
    if (el('reportTotalRevenue')) el('reportTotalRevenue').innerText = totalRevenue.toLocaleString();
    if (el('reportTotalExpenses')) el('reportTotalExpenses').innerText = totalExpenses.toLocaleString();
    if (el('reportNetBalance')) el('reportNetBalance').innerText = balance.toLocaleString();
}

function renderOfficialDocs() {
    const statutEl = document.getElementById('statutContent');
    const reglementEl = document.getElementById('reglementContent');
    if (statutEl) statutEl.innerText = appData.officialDocs.statut || 'Aucun statut';
    if (reglementEl) reglementEl.innerText = appData.officialDocs.reglement || 'Aucun règlement';
}

function populateMemberSelects() {
    const selects = ['contribMember', 'sanctionPlayer', 'blessurePlayer', 'licencePlayer', 'matchHommeMatch'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Sélectionner</option>';
            appData.members.forEach(m => {
                select.innerHTML += `<option value="${m.id}">${m.firstName} ${m.lastName}</option>`;
            });
        }
    });
}

// ============================================
// MODALES ET FORMULAIRES
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('flex');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('flex');
}

function openMemberModal(id = null) {
    document.getElementById('memberModalTitle').innerText = id ? 'Modifier Membre' : 'Nouveau Membre';
    document.getElementById('memberId').value = id || '';
    
    if (id) {
        const m = appData.members.find(x => x.id === id);
        if (m) {
            document.getElementById('memberNom').value = m.lastName || '';
            document.getElementById('memberPrenom').value = m.firstName || '';
            document.getElementById('memberDateNaissance').value = m.dob || '';
            document.getElementById('memberLieuNaissance').value = m.pob || '';
            document.getElementById('memberSexe').value = m.gender || 'Masculin';
            document.getElementById('memberSituation').value = m.civilStatus || 'Célibataire';
            document.getElementById('memberProfession').value = m.profession || '';
            document.getElementById('memberFonction').value = m.fonction || '';
            document.getElementById('memberCategorie').value = m.category || 'Jeune';
            document.getElementById('memberStatutAdhesion').value = m.statutAdhesion || 'aucun';
            document.getElementById('memberEquipe').value = m.team || 'A';
            document.getElementById('memberCapitaine').value = m.isCaptain ? 'true' : 'false';
            document.getElementById('memberStatut').value = m.status || 'Actif';
            document.getElementById('memberPoste').value = m.position || '';
            document.getElementById('memberNumero').value = m.number || '';
            document.getElementById('memberTel').value = m.phone || '';
            document.getElementById('memberEmail').value = m.email || '';
            document.getElementById('memberAdresse').value = m.address || '';
        }
    } else {
        document.querySelectorAll('#memberModal input, #memberModal select').forEach(el => el.value = '');
        document.getElementById('memberStatut').value = 'Actif';
    }
    
    openModal('memberModal');
}

async function saveMember() {
    const id = document.getElementById('memberId').value;
    const photoInput = document.getElementById('memberPhoto');
    
    let photoUrl = '';
    if (photoInput && photoInput.files && photoInput.files[0]) {
        showToast('Upload photo...', false);
        const file = photoInput.files[0];
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);
        if (uploadError) {
            showToast('Erreur upload: ' + uploadError.message, true);
            return;
        }
        
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
        photoUrl = publicUrl;
    }
    
    const dbData = {
        nom: document.getElementById('memberNom').value,
        prenom: document.getElementById('memberPrenom').value,
        date_naissance: document.getElementById('memberDateNaissance').value || null,
        lieu_naissance: document.getElementById('memberLieuNaissance').value,
        sexe: document.getElementById('memberSexe').value,
        situation: document.getElementById('memberSituation').value,
        profession: document.getElementById('memberProfession').value,
        fonction_bureau: document.getElementById('memberFonction').value,
        categorie: document.getElementById('memberCategorie').value,
        statut_adhesion: document.getElementById('memberStatutAdhesion').value,
        equipe: document.getElementById('memberEquipe').value,
        capitaine: document.getElementById('memberCapitaine').value === 'true',
        statut_membre: document.getElementById('memberStatut').value,
        poste: document.getElementById('memberPoste').value,
        numero: parseInt(document.getElementById('memberNumero').value) || null,
        tel: document.getElementById('memberTel').value,
        email: document.getElementById('memberEmail').value,
        adresse: document.getElementById('memberAdresse').value,
        photo_url: photoUrl
    };
    
    let error;
    if (id) {
        const res = await supabase.from('membres').update(dbData).eq('id', id);
        error = res.error;
    } else {
        const res = await supabase.from('membres').insert([dbData]).select();
        error = res.error;
    }
    
    if (error) {
        showToast('Erreur: ' + error.message, true);
    } else {
        showToast('Membre enregistré !', false);
        closeModal('memberModal');
        await loadData();
    }
}

async function deleteMember(id) {
    if (confirm('Supprimer ce membre ?')) {
        const { error } = await supabase.from('membres').delete().eq('id', id);
        if (error) {
            showToast('Erreur: ' + error.message, true);
        } else {
            showToast('Membre supprimé !', false);
            await loadData();
        }
    }
}

// ============================================
// UTILITAIRES
// ============================================
function showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log(message);
        return;
    }
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function checkMobileView() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) {
        mobileBtn.style.display = window.innerWidth <= 1023 ? 'flex' : 'none';
    }
}

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    checkMobileView();
    loadData();
});

window.addEventListener('resize', checkMobileView);
