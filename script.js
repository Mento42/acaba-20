// ============================================
// ACABA 2#0 - Script Principal Complet
// Système Multi-utilisateurs : Admin + Bureau + Membres
// ============================================

const SUPABASE_URL = 'https://gajleiddneqwzbrzahgh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SO6dPdPS8DQzQ3tkx6FXsg_ctWy8X_U'; // ⚠️ REMPLACEZ PAR VOTRE CLÉ
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
window.currentUser = null;

// ============================================
// AUTHENTIFICATION ET PERMISSIONS
// ============================================

async function checkAuth() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      window.location.href = 'login.html';
      return false;
    }
    
    const userEmail = session.user.email;
    let userRole = 'membre';
    let userFonction = 'Membre';
    
    try {
      const { data: user } = await supabaseClient
        .from('utilisateurs')
        .select('role, fonction')
        .eq('email', userEmail)
        .single();
      
      if (user) {
        userRole = user.role;
        userFonction = user.fonction;
      }
    } catch (err) {
      console.log('Utilisateur non trouvé, rôle membre par défaut');
    }
    
    window.currentUser = {
      email: userEmail,
      role: userRole,
      fonction: userFonction
    };
    
    console.log('✅ Connecté:', userFonction, '(', userRole, ')');
    
    displayUserInfo();
    applyPermissions();
    applyMemberView();
    
    return true;
    
  } catch (error) {
    console.error('Erreur checkAuth:', error);
    window.location.href = 'login.html';
    return false;
  }
}

function displayUserInfo() {
  const userInfo = document.getElementById('userInfo');
  const userInfoText = document.getElementById('userInfoText');
  if (userInfo && userInfoText && window.currentUser) {
    let roleText = 'Membre';
    if (window.currentUser.role === 'admin') roleText = 'Admin';
    else if (window.currentUser.role === 'bureau') roleText = 'Bureau';
    
    userInfoText.textContent = `${window.currentUser.fonction} • ${roleText}`;
    userInfo.style.display = 'block';
  }
}

function hasPermission(action) {
  if (!window.currentUser) return false;
  
  const permissions = {
    'admin': ['create', 'read', 'update', 'delete', 'manage_users', 'export', 'import'],
    'bureau': ['create', 'read', 'update', 'export'],
    'membre': ['read']
  };
  
  return permissions[window.currentUser.role]?.includes(action) || false;
}

function applyPermissions() {
  if (!window.currentUser) return;
  
  const role = window.currentUser.role;
  
  // ADMIN : accès total
  if (role === 'admin') return;
  
  // BUREAU : pas de suppression, pas d'import
  if (role === 'bureau') {
    if (!hasPermission('delete')) {
      document.querySelectorAll('.btn-danger').forEach(btn => {
        if (btn.innerHTML && btn.innerHTML.includes('trash')) {
          btn.style.display = 'none';
        }
      });
    }
    if (!hasPermission('import')) {
      const importBtn = document.querySelector('button[onclick*="importFile"]');
      if (importBtn) importBtn.style.display = 'none';
    }
    return;
  }
  
  // MEMBRE : très restrictif
  if (role === 'membre') {
    document.querySelectorAll('.btn-primary, .btn-danger, .btn-gold').forEach(btn => {
      btn.style.display = 'none';
    });
  }
}

function applyMemberView() {
  if (!window.currentUser) return;
  
  const role = window.currentUser.role;
  
  // Pour les membres, cacher uniquement "Paramètres" et "Partager"
  if (role === 'membre') {
    // ✅ Seulement ces 2 onglets sont cachés
    const hiddenTabs = ['settings', 'share-app'];
    
    hiddenTabs.forEach(tabId => {
      const link = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
      if (link) link.style.display = 'none';
    });
    
    // Cacher les boutons d'action (ajout, modification, suppression, export/import)
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-danger, .btn-gold').forEach(btn => {
      const text = btn.textContent.toLowerCase();
      if (text.includes('nouveau') || text.includes('ajouter') || 
          text.includes('modifier') || text.includes('enregistrer') ||
          text.includes('supprimer') || text.includes('exporter') ||
          text.includes('importer') || text.includes('réinitialiser') ||
          text.includes('purger')) {
        btn.style.display = 'none';
      }
    });
    
    // Rediriger vers le tableau de bord si sur un onglet interdit
    const currentTab = document.querySelector('.tab-content:not(.hidden)');
    if (currentTab && hiddenTabs.includes(currentTab.id)) {
      switchTab('dashboard');
    }
  }
}

async function logout() {
  if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_fonction');
    localStorage.removeItem('user_email');
    window.location.href = 'login.html';
  }
}

// ============================================
// DICTIONNAIRE DE TRADUCTION
// ============================================
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
  "member-statement": { fr: "Mon Relevé", en: "My Statement" },
  "annual-report": { fr: "Bilan Annuel", en: "Annual Report" },
  "official-docs": { fr: "Statut & Règlement", en: "Rules & Regulations" },
  "share-app": { fr: "Partager", en: "Share" },
  "settings": { fr: "Paramètres", en: "Settings" },
  "logout": { fr: "Déconnexion", en: "Logout" },
  "active_members": { fr: "Membres actifs", en: "Active Members" },
  "cfa_collected": { fr: "CFA collectés", en: "CFA Collected" },
  "matches_played": { fr: "Matchs joués", en: "Matches Played" },
  "next_match": { fr: "Prochain match", en: "Next Match" },
  "contributions_evolution": { fr: "Évolution des Contributions", en: "Contributions Evolution" },
  "distribution_category": { fr: "Répartition par Catégorie", en: "Distribution by Category" },
  "achievement_rate": { fr: "Taux de Réalisation", en: "Achievement Rate" },
  "up_to_date": { fr: "À jour", en: "Up to date" },
  "partial": { fr: "Partiel", en: "Partial" },
  "late": { fr: "En retard", en: "Late" },
  "member_management": { fr: "Gestion des Membres", en: "Member Management" },
  "new_member": { fr: "Nouveau Membre", en: "New Member" },
  "search_member": { fr: "Rechercher...", en: "Search..." },
  "all_categories": { fr: "Toutes catégories", en: "All categories" },
  "youth": { fr: "Jeune", en: "Youth" },
  "veteran": { fr: "Vétéran", en: "Veteran" },
  "all_genders": { fr: "Tous sexes", en: "All genders" },
  "male": { fr: "Masculin", en: "Male" },
  "female": { fr: "Féminin", en: "Female" },
  "all_statuses": { fr: "Tous statuts", en: "All statuses" },
  "member": { fr: "Membre", en: "Member" },
  "birth": { fr: "Naissance", en: "Birth" },
  "team": { fr: "Équipe", en: "Team" },
  "annual_dues": { fr: "Cotisation Annuelle", en: "Annual Dues" },
  "status": { fr: "Statut", en: "Status" },
  "actions": { fr: "Actions", en: "Actions" },
  "new": { fr: "Nouvelle", en: "New" },
  "dues_paid": { fr: "Cotisation Versée", en: "Dues Paid" },
  "registration_paid": { fr: "Inscription Versée", en: "Registration Paid" },
  "history": { fr: "Historique", en: "History" },
  "date": { fr: "Date", en: "Date" },
  "amount": { fr: "Montant", en: "Amount" },
  "type": { fr: "Type", en: "Type" },
  "expenses_year": { fr: "Dépenses (Année)", en: "Expenses (Year)" },
  "current_balance": { fr: "Solde Actuel", en: "Current Balance" },
  "reason": { fr: "Motif", en: "Reason" },
  "beneficiary": { fr: "Bénéficiaire", en: "Beneficiary" },
  "sanction": { fr: "Sanction", en: "Sanction" },
  "referee": { fr: "Arbitre", en: "Referee" },
  "referees": { fr: "Arbitres", en: "Referees" },
  "player": { fr: "Joueur", en: "Player" },
  "paid": { fr: "Payé", en: "Paid" },
  "unpaid": { fr: "Impayé", en: "Unpaid" },
  "remaining": { fr: "Reste", en: "Remaining" },
  "name": { fr: "Nom", en: "Name" },
  "contact": { fr: "Contact", en: "Contact" },
  "matches": { fr: "Matchs", en: "Matches" },
  "official_license": { fr: "LICENCE OFFICIELLE", en: "OFFICIAL LICENSE" },
  "association_name": { fr: "Association Club des Amis de Biyem-Assi", en: "Association Club of Biyem-Assi Friends" },
  "full_name": { fr: "NOM PRÉNOM:", en: "FULL NAME:" },
  "born_on": { fr: "Né(e) le:", en: "Born on:" },
  "position": { fr: "Poste:", en: "Position:" },
  "jersey_no": { fr: "N° Maillot:", en: "Jersey No:" },
  "category": { fr: "Catégorie:", en: "Category:" },
  "scan_verify": { fr: "Scanner pour vérifier", en: "Scan to verify" },
  "club_stamp": { fr: "Cachet du Club", en: "Club Stamp" },
  "injury": { fr: "Blessure", en: "Injury" },
  "duration": { fr: "Durée", en: "Duration" },
  "best_player": { fr: "Meilleur Joueur de l'Année", en: "Best Player of the Year" },
  "nominations": { fr: "désignations", en: "nominations" },
  "top_striker": { fr: "Meilleur Buteur de l'Année", en: "Top Scorer of the Year" },
  "goals": { fr: "buts", en: "goals" },
  "team_a": { fr: "Équipe A", en: "Team A" },
  "team_b": { fr: "Équipe B", en: "Team B" },
  "players": { fr: "joueurs", en: "players" },
  "captains": { fr: "Capitaines", en: "Captains" },
  "weekly_matches": { fr: "Matchs Hebdomadaires", en: "Weekly Matches" },
  "match": { fr: "Match", en: "Match" },
  "score": { fr: "Score", en: "Score" },
  "scorers": { fr: "Buteurs", en: "Scorers" },
  "man_match": { fr: "Homme du Match", en: "Man of the Match" },
  "intergen_championship": { fr: "Championnat Intergénération", en: "Intergenerational Championship" },
  "champion": { fr: "Champion", en: "Champion" },
  "veterans": { fr: "Vétérans", en: "Veterans" },
  "quarter": { fr: "Trimestre", en: "Quarter" },
  "winner": { fr: "Vainqueur", en: "Winner" },
  "friendly_matches": { fr: "Matchs Amicaux", en: "Friendly Matches" },
  "opponent": { fr: "Adversaire", en: "Opponent" },
  "clear_history": { fr: "Purger l'historique", en: "Clear History" },
  "all_years": { fr: "Toutes années", en: "All years" },
  "registration_fee": { fr: "Frais d'Inscription", en: "Registration Fee" },
  "remaining_0": { fr: "Reste: 0 F", en: "Remaining: 0 F" },
  "annual_report": { fr: "Bilan Annuel", en: "Annual Report" },
  "revenue": { fr: "Revenus", en: "Revenue" },
  "balance": { fr: "Solde", en: "Balance" },
  "official_docs": { fr: "Statut & Règlement", en: "Rules & Regulations" },
  "edit": { fr: "Modifier", en: "Edit" },
  "regulations": { fr: "Règlement", en: "Regulations" },
  "save": { fr: "Enregistrer", en: "Save" },
  "cancel": { fr: "Annuler", en: "Cancel" },
  "share": { fr: "Partager", en: "Share" },
  "download_app": { fr: "Télécharger l'app", en: "Download App" },
  "export_json": { fr: "Exporter JSON", en: "Export JSON" },
  "import_json": { fr: "Importer JSON", en: "Import JSON" },
  "backup_restore": { fr: "Sauvegarde & Restauration", en: "Backup & Restore" },
  "association_name_label": { fr: "Nom de l'association", en: "Association Name" },
  "logo": { fr: "Logo", en: "Logo" },
  "reset": { fr: "Réinitialiser", en: "Reset" },
  "space_used": { fr: "Espace utilisé :", en: "Space used:" },
  "storage_warning": { fr: "Si la barre est rouge, l'application ne peut plus sauvegarder.", en: "If the bar is red, the app cannot save." },
  "last_name": { fr: "Nom *", en: "Last Name *" },
  "first_name": { fr: "Prénom *", en: "First Name *" },
  "dob": { fr: "Date de naissance", en: "Date of Birth" },
  "pob": { fr: "Lieu de naissance", en: "Place of Birth" },
  "gender": { fr: "Sexe", en: "Gender" },
  "civil_status": { fr: "Situation", en: "Civil Status" },
  "single": { fr: "Célibataire", en: "Single" },
  "married": { fr: "Marié(e)", en: "Married" },
  "divorced": { fr: "Divorcé(e)", en: "Divorced" },
  "widowed": { fr: "Veuf/Veuve", en: "Widowed" },
  "profession": { fr: "Profession", en: "Profession" },
  "board_role": { fr: "Fonction au Bureau", en: "Board Role" },
  "none": { fr: "Aucune", en: "None" },
  "president": { fr: "Président", en: "President" },
  "vice_president": { fr: "Vice Président", en: "Vice President" },
  "secretary_general": { fr: "Secrétaire Général", en: "Secretary General" },
  "deputy_sec": { fr: "Secrétaire Général Adjoint", en: "Deputy Secretary General" },
  "treasurer": { fr: "Trésorier", en: "Treasurer" },
  "auditor": { fr: "Commissaire aux comptes", en: "Auditor" },
  "censor_1": { fr: "Censeur N°1", en: "Censor N°1" },
  "censor_2": { fr: "Censeur N°2", en: "Censor N°2" },
  "sports_culture": { fr: "Chargé des Sports et de la Culture", en: "Sports & Culture Manager" },
  "special_advisor": { fr: "Conseiller Spécial", en: "Special Advisor" },
  "membership_type": { fr: "Type d'Adhésion *", en: "Membership Type *" },
  "unregistered": { fr: "0 FCFA (Non inscrit)", en: "0 FCFA (Unregistered)" },
  "re_registration": { fr: "5 000 FCFA (Réinscription)", en: "5 000 FCFA (Re-registration)" },
  "registration": { fr: "10 000 FCFA (Inscription)", en: "10 000 FCFA (Registration)" },
  "captain": { fr: "Capitaine", en: "Captain" },
  "no": { fr: "Non", en: "No" },
  "yes": { fr: "Oui", en: "Yes" },
  "goalkeeper": { fr: "Gardien", en: "Goalkeeper" },
  "defender": { fr: "Défenseur", en: "Defender" },
  "midfielder": { fr: "Milieu", en: "Midfielder" },
  "forward": { fr: "Attaquant", en: "Forward" },
  "number": { fr: "Numéro", en: "Number" },
  "phone": { fr: "Téléphone", en: "Phone" },
  "email": { fr: "Email", en: "Email" },
  "address": { fr: "Adresse", en: "Address" },
  "photo": { fr: "Photo", en: "Photo" },
  "new_contribution": { fr: "Nouvelle Contribution", en: "New Contribution" },
  "payment_type": { fr: "Type de Paiement *", en: "Payment Type *" },
  "annual_dues_fee": { fr: "Cotisation Annuelle (25 000 F)", en: "Annual Dues (25 000 F)" },
  "registration_fee_opt": { fr: "Frais d'inscription (10 000 F)", en: "Registration Fee (10 000 F)" },
  "re_registration_fee": { fr: "Frais de Réinscription (5 000 F)", en: "Re-registration Fee (5 000 F)" },
  "other": { fr: "Autre", en: "Other" },
  "expense": { fr: "Dépense", en: "Expense" },
  "yellow_card": { fr: "Carton Jaune", en: "Yellow Card" },
  "red_card": { fr: "Carton Rouge", en: "Red Card" },
  "suspension": { fr: "Suspension", en: "Suspension" },
  "ag_sanction": { fr: "Sanction AG", en: "AG Sanction" },
  "amount_f": { fr: "Montant (F)", en: "Amount (F)" },
  "duration_days": { fr: "Durée (jours)", en: "Duration (days)" },
  "in_treatment": { fr: "En soin", en: "In treatment" },
  "recovered": { fr: "Guéri", en: "Recovered" },
  "resumed": { fr: "Reprise", en: "Resumed" },
  "weekly": { fr: "Hebdomadaire", en: "Weekly" },
  "intergenerational": { fr: "Intergénération", en: "Intergenerational" },
  "friendly": { fr: "Amical", en: "Friendly" },
  "opponent_friendly": { fr: "Adversaire (si Amical)", en: "Opponent (if Friendly)" },
  "score_1": { fr: "Score 1", en: "Score 1" },
  "score_2": { fr: "Score 2", en: "Score 2" },
  "center_referee": { fr: "Arbitre Central", en: "Center Referee" },
  "commissioner": { fr: "Commissaire", en: "Commissioner" },
  "judge_1": { fr: "Juge 1", en: "Judge 1" },
  "judge_2": { fr: "Juge 2", en: "Judge 2" },
  "list_scorers": { fr: "Liste des buteurs...", en: "List of scorers..." },
  "list_assists": { fr: "Liste des passeurs...", en: "List of assists..." },
  "assists": { fr: "Passeurs", en: "Assists" },
  "match_sheet_a": { fr: "Feuille de match Equipe A ou 1", en: "Match Sheet Team A or 1" },
  "match_sheet_b": { fr: "Feuille de match Equipe B ou 2", en: "Match Sheet Team B or 2" },
  "member_saved": { fr: "Membre enregistré !", en: "Member saved!" },
  "contribution_saved": { fr: "Contribution ajoutée !", en: "Contribution added!" },
  "expense_saved": { fr: "Dépense ajoutée !", en: "Expense added!" },
  "settings_saved": { fr: "Paramètres enregistrés !", en: "Settings saved!" },
  "no_board_members": { fr: "Aucun membre du bureau désigné.", en: "No board members designated." },
  "unregistered_status": { fr: "Non inscrit", en: "Unregistered" },
  "member_deleted": { fr: "Membre supprimé !", en: "Member deleted!" },
  "age": { fr: "Âge", en: "Age" },
  "cards": { fr: "Cartons (Année)", en: "Cards (Year)" },
  "member_details": { fr: "Fiche du Membre", en: "Member Details" },
  "sanction_saved": { fr: "Sanction enregistrée !", en: "Sanction saved!" },
  "referee_saved": { fr: "Arbitre enregistré !", en: "Referee saved!" },
  "sanction_deleted": { fr: "Sanction supprimée !", en: "Sanction deleted!" },
  "referee_deleted": { fr: "Arbitre supprimé !", en: "Referee deleted!" },
  "match_saved": { fr: "Match enregistré !", en: "Match saved!" },
  "match_deleted": { fr: "Match supprimé !", en: "Match deleted!" },
  "injury_saved": { fr: "Blessure enregistrée !", en: "Injury saved!" },
  "injury_deleted": { fr: "Blessure supprimée !", en: "Injury deleted!" },
  "docs_saved": { fr: "Documents enregistrés !", en: "Documents saved!" },
  "no_injuries": { fr: "Aucun joueur à l'infirmerie.", en: "No players in the infirmary." },
  "injured_players": { fr: "Joueurs à l'Infirmerie", en: "Injured Players" },
  "view_sanctions": { fr: "Aperçu Sanctions", en: "View Sanctions" },
  "pay_sanction": { fr: "Encaisser", en: "Pay" },
  "payment_saved": { fr: "Paiement enregistré !", en: "Payment recorded!" },
  "no_sanctions": { fr: "Aucune sanction enregistrée.", en: "No sanctions recorded." },
  "sanctions_of": { fr: "Sanctions de", en: "Sanctions of" },
  "data_exported": { fr: "Données exportées !", en: "Data exported!" },
  "download_app_msg": { fr: "Utilisez Ctrl+S pour sauvegarder.", en: "Use Ctrl+S to save." },
  "storage_full": { fr: "Mémoire pleine !", en: "Memory full!" },
  "no_scorers": { fr: "Aucun but enregistré.", en: "No goals recorded." },
  "no_assisters": { fr: "Aucune passe enregistrée.", en: "No assists recorded." },
  "annual_dues_badge": { fr: "Cotisations Annuelles", en: "Annual Dues" },
  "cards_total": { fr: "Cartons", en: "Cards" },
  "ag_sanctions": { fr: "Sanctions AG", en: "AG Sanctions" },
  "unpaid_sanctions": { fr: "Sanctions Impayées", en: "Unpaid Sanctions" },
  "contributions_history": { fr: "Historique des Contributions", en: "Contributions History" },
  "cards_history": { fr: "Historique des Cartons", en: "Cards History" },
  "ag_sanctions_history": { fr: "Historique des Sanctions AG", en: "AG Sanctions History" },
  "unpaid_sanctions_history": { fr: "Historique des Sanctions Impayées", en: "Unpaid Sanctions History" },
  "no_contributions": { fr: "Aucune contribution enregistrée.", en: "No contributions recorded." },
  "no_cards": { fr: "Aucun carton enregistré.", en: "No cards recorded." },
  "no_ag_sanctions": { fr: "Aucune sanction AG enregistrée.", en: "No AG sanctions recorded." },
  "no_unpaid_sanctions": { fr: "Aucune sanction impayée.", en: "No unpaid sanctions." },
  "total": { fr: "Total", en: "Total" },
  "yellow_cards": { fr: "Cartons Jaunes", en: "Yellow Cards" },
  "red_cards": { fr: "Cartons Rouges", en: "Red Cards" },
  "cumulative_score": { fr: "Score Cumulé", en: "Cumulative Score" },
  "all_matches": { fr: "Tous les matchs", en: "All matches" },
  "team_leading": { fr: "En tête", en: "Leading" },
  "victories": { fr: "Victoires", en: "Victories" },
  "draws": { fr: "Matchs nuls", en: "Draws" },
  "weekly_champion": { fr: "Champion Hebdomadaire", en: "Weekly Champion" },
  "defeats": { fr: "Défaites", en: "Defeats" },
  "sort_oldest_first": { fr: "Plus ancien d'abord", en: "Oldest first" },
  "sort_newest_first": { fr: "Plus récent d'abord", en: "Newest first" }
};

const roleTranslationMap = {
  "Président": "president", "Vice Président": "vice_president", "Secrétaire Général": "secretary_general",
  "Secrétaire Général Adjoint": "deputy_sec", "Trésorier": "treasurer", "Commissaire aux comptes": "auditor",
  "Censeur N°1": "censor_1", "Censeur N°2": "censor_2", "Chargé des Sports et de la Culture": "sports_culture",
  "Conseiller Spécial": "special_advisor"
};

// ============================================
// NAVIGATION ENTRE ONGLETS
// ============================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove('hidden');
  
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
  if (activeLink) activeLink.classList.add('active');
  
  if (window.innerWidth <= 1023) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }
  
  setTimeout(() => {
    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'members') renderMembersTable();
    if (tabId === 'contributions') renderContributions();
    if (tabId === 'expenses') renderExpenses();
    if (tabId === 'bureau') renderBureau();
    if (tabId === 'sanctions') { renderSanctions(); renderArbitres(); }
    if (tabId === 'licences') { populateMemberSelects(); renderLicencePreview(); }
    if (tabId === 'infirmerie') renderInfirmerie();
    if (tabId === 'teams') { renderTeams(); renderMatches(); }
    if (tabId === 'member-statement') { populateMemberSelects(); renderMemberStatement(); }
    if (tabId === 'annual-report') renderAnnualReport();
    if (tabId === 'official-docs') renderOfficialDocs();
    if (tabId === 'settings') updateStorageUsage();
  }, 100);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

function checkMobileView() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) mobileBtn.style.display = window.innerWidth <= 1023 ? 'flex' : 'none';
}
window.addEventListener('resize', checkMobileView);

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('flex');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('flex');
}

function showToast(message, isError = false) {
  const container = document.getElementById('toastContainer');
  if (!container) { console.log(message); return; }
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function toggleLanguage() {
  currentLang = currentLang === 'fr' ? 'en' : 'fr';
  localStorage.setItem('acaba_lang', currentLang);
  applyTranslations();
  renderAll();
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  const langBtn = document.getElementById('langBtn');
  if (langBtn) langBtn.innerText = currentLang === 'fr' ? 'EN' : 'FR';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key] && translations[key][currentLang]) el.textContent = translations[key][currentLang];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (translations[key] && translations[key][currentLang]) el.placeholder = translations[key][currentLang];
  });
}

function getSortedMembers() {
  return [...appData.members].sort((a, b) => {
    const lnA = (a.lastName || '').toLowerCase(), lnB = (b.lastName || '').toLowerCase();
    if (lnA !== lnB) return lnA.localeCompare(lnB);
    return (a.firstName || '').toLowerCase().localeCompare((b.firstName || '').toLowerCase());
  });
}

function getFullName(m) { return `${m.lastName || ''} ${m.firstName || ''}`.trim(); }

function calculateAge(dob) {
  if (!dob) return '-';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function updateStorageUsage() {
  const usageEl = document.getElementById('storageUsage');
  const barEl = document.getElementById('storageBar');
  if (usageEl) usageEl.innerText = `Supabase: illimité`;
  if (barEl) {
    barEl.style.width = '10%';
    barEl.style.background = 'linear-gradient(90deg, var(--primary), var(--gold))';
  }
}

// ============================================
// CHARGEMENT DES DONNÉES DEPUIS SUPABASE
// ============================================
async function loadData() {
  const isAuth = await checkAuth();
  if (!isAuth) return;
  
  showToast('Chargement...', false);
  
  try {
    const [
      { data: dbMembers, error: errM },
      { data: dbContribs, error: errC },
      { data: dbExpenses, error: errE },
      { data: dbSanctions, error: errS },
      { data: dbReferees, error: errR },
      { data: dbMatches, error: errMatch },
      { data: dbInjuries, error: errI },
      { data: dbDocs, error: errD }
    ] = await Promise.all([
      supabaseClient.from('membres').select('*'),
      supabaseClient.from('contributions').select('*'),
      supabaseClient.from('depenses').select('*'),
      supabaseClient.from('sanctions').select('*'),
      supabaseClient.from('arbitres').select('*'),
      supabaseClient.from('matchs').select('*'),
      supabaseClient.from('blessures').select('*'),
      supabaseClient.from('parametres').select('cle, valeur')
    ]);

    if (errM) console.error('Erreur membres:', errM);
    if (errC) console.error('Erreur contributions:', errC);

    appData.members = (dbMembers || []).map(m => ({
      id: m.id, lastName: m.nom, firstName: m.prenom, dob: m.date_naissance,
      pob: m.lieu_naissance, gender: m.sexe, civilStatus: m.situation,
      profession: m.profession, fonction: m.fonction_bureau, category: m.categorie,
      statutAdhesion: m.statut_adhesion, team: m.equipe, isCaptain: m.capitaine,
      position: m.poste, number: m.numero, phone: m.tel, email: m.email,
      address: m.adresse, photo: m.photo_url, status: m.statut_membre
    }));

    appData.contributions = (dbContribs || []).map(c => ({
      id: c.id, memberId: c.membre_id, amount: c.montant, date: c.date_paiement, type: c.type_paiement
    }));

    appData.expenses = (dbExpenses || []).map(e => ({
      id: e.id, amount: e.montant, date: e.date_depense, reason: e.motif, beneficiary: e.beneficiaire
    }));

    appData.sanctions = (dbSanctions || []).map(s => ({
      id: s.id, memberId: s.joueur_id, type: s.type_sanction, amount: s.montant,
      amountPaid: s.montant_paye || 0, date: s.date_sanction, reason: s.motif
    }));

    appData.referees = (dbReferees || []).map(r => ({
      id: r.id, name: r.nom, phone: r.tel, email: r.email, photo: r.photo_url
    }));

    appData.matches = (dbMatches || []).map(m => ({
      id: m.id, type: m.type_match, date: m.date_match, trimester: m.trimestre,
      opponent: m.adversaire, score1: m.score1, score2: m.score2, manOfMatch: m.homme_match_id,
      refereeCentral: m.arbitre_central, commissioner: m.commissaire, judge1: m.juge1, judge2: m.juge2,
      scorers: m.buteurs, assists: m.passeurs, sheet1: m.feuille_match1, sheet2: m.feuille_match2
    }));

    appData.injuries = (dbInjuries || []).map(i => ({
      id: i.id, memberId: i.joueur_id, type: i.type_blessure, duration: i.duree_jours,
      date: i.date_blessure, status: i.statut
    }));

    const docs = dbDocs || [];
    appData.officialDocs.statut = docs.find(d => d.cle === 'statut')?.valeur || "";
    appData.officialDocs.reglement = docs.find(d => d.cle === 'reglement')?.valeur || "";
    appData.settings.name = docs.find(d => d.cle === 'nom_association')?.valeur || "ACABA 2#0";
    appData.settings.logo = docs.find(d => d.cle === 'logo_url')?.valeur || "";

    console.log('Données chargées:', appData.members.length, 'membres');
    showToast(`${appData.members.length} membres chargés`, false);
    renderAll();
    
  } catch (error) {
    console.error('Erreur loadData:', error);
    showToast('Erreur: ' + error.message, true);
  }
}

function renderAll() {
  applySettings();
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
  renderOfficialDocs();
  renderAnnualReport();
  populateMemberSelects();
  updateMatchSortButton();
}

function applySettings() {
  const favicon = document.getElementById('favicon');
  const logoBox = document.getElementById('logoBox');
  const settingNomInput = document.getElementById('settingNom');
  if (settingNomInput && appData.settings.name) settingNomInput.value = appData.settings.name;
  if (appData.settings.logo) {
    if (favicon) favicon.href = appData.settings.logo;
    if (logoBox) logoBox.innerHTML = `<img src="${appData.settings.logo}" alt="Logo">`;
  }
}

// ============================================
// TABLEAU DE BORD
// ============================================
function renderDashboard() {
  const el = (id) => document.getElementById(id);
  if (el('totalMembers')) el('totalMembers').innerText = appData.members.length;
  
  const totalCollected = appData.contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  if (el('totalCollected')) el('totalCollected').innerText = totalCollected.toLocaleString();
  if (el('totalMatches')) el('totalMatches').innerText = appData.matches.length;

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

  let membersOk = 0, membersPartial = 0, membersLate = 0, totalAnnualDuesCollected = 0;
  const annualTarget = 25000;
  appData.members.forEach(m => {
    let duesPaid = appData.contributions.filter(c => c.memberId == m.id && c.type === "Cotisation Annuelle").reduce((sum, c) => sum + Number(c.amount), 0);
    totalAnnualDuesCollected += duesPaid;
    if (duesPaid >= annualTarget) membersOk++;
    else if (duesPaid >= 15000) membersPartial++;
    else membersLate++;
  });
  
  if (el('membersOk')) el('membersOk').innerText = membersOk;
  if (el('membersPartial')) el('membersPartial').innerText = membersPartial;
  if (el('membersLate')) el('membersLate').innerText = membersLate;

  const goalAmount = appData.members.length * annualTarget;
  const completionRate = goalAmount > 0 ? (totalAnnualDuesCollected / goalAmount) * 100 : 0;
  if (el('completionRate')) el('completionRate').innerText = completionRate.toFixed(1) + '%';
  if (el('goalAmount')) el('goalAmount').innerText = goalAmount.toLocaleString() + ' F';
  if (el('completionBar')) el('completionBar').style.width = completionRate + '%';

  renderCategoryChart();
  renderContribChart();
}

function renderCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  if (!ctx || typeof Chart === 'undefined') return;
  let jeunes = 0, veterans = 0;
  appData.members.forEach(m => {
    if (m.category === 'Jeune') jeunes++;
    else if (m.category === 'Vétéran') veterans++;
  });
  if (categoryChartInstance) categoryChartInstance.destroy();
  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Jeunes', 'Vétérans'], datasets: [{ data: [jeunes, veterans], backgroundColor: ['#00ff87', '#04f5ff'], borderWidth: 1 }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#71717a' } } } }
  });
}

function renderContribChart() {
  const ctx = document.getElementById('contribChart');
  if (!ctx || typeof Chart === 'undefined') return;
  const monthlyData = {};
  appData.contributions.forEach(c => {
    if (c.date) {
      const month = c.date.substring(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + Number(c.amount);
    }
  });
  const labels = Object.keys(monthlyData).sort();
  const data = labels.map(m => monthlyData[m]);
  if (contribChartInstance) contribChartInstance.destroy();
  contribChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: [{ label: 'Contributions (F)', data: data, backgroundColor: '#37003c', borderColor: '#00ff87', borderWidth: 1 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { color: '#71717a' } }, x: { ticks: { color: '#71717a' } } }, plugins: { legend: { display: false } } }
  });
}

// ============================================
// MEMBRES
// ============================================
function renderMembersTable() {
  const tbody = document.getElementById('membersTable');
  if (!tbody) return;
  tbody.innerHTML = '';
  const search = (document.getElementById('searchMember')?.value || '').toLowerCase();
  const filterCat = document.getElementById('filterCategory')?.value || '';
  const filterSexe = document.getElementById('filterSexe')?.value || '';
  const filterStatut = document.getElementById('filterStatut')?.value || '';
  
  getSortedMembers()
    .filter(m => {
      if (search && !getFullName(m).toLowerCase().includes(search)) return false;
      if (filterCat && m.category !== filterCat) return false;
      if (filterSexe && m.gender !== filterSexe) return false;
      if (filterStatut && m.status !== filterStatut) return false;
      return true;
    })
    .forEach(m => {
      const initials = `${(m.firstName||'').charAt(0)}${(m.lastName||'').charAt(0)}`;
      const avatarHtml = m.photo ? `<img src="${m.photo}" alt="${m.firstName}">` : initials;
      const captainBadge = m.isCaptain ? `<span style="color: #ca8a04; font-weight: 900; margin-left: 5px;">(C)</span>` : '';
      const goalkeeperBadge = m.position === 'Gardien' ? `<span style="color: var(--primary); font-weight: 900; margin-left: 5px;">(Gk)</span>` : '';
      
      let membershipPaid = 0, membershipTarget = 0, filterType = "", displayType = "";
      if (m.statutAdhesion === 'inscription') { membershipTarget = 10000; filterType = "Inscription"; displayType = "Inscription"; }
      else if (m.statutAdhesion === 'reinscription') { membershipTarget = 5000; filterType = "Réinscription"; displayType = "Réinscription"; }
      
      let feeHtml = "";
      if (membershipTarget > 0) {
        membershipPaid = appData.contributions.filter(c => c.memberId == m.id && c.type === filterType).reduce((sum, c) => sum + Number(c.amount), 0);
        feeHtml = `<span style="color: ${(membershipPaid >= membershipTarget) ? "var(--gold-dark)" : "#ff0033"}; font-weight: 700; font-size:11px;">${displayType}: ${membershipPaid.toLocaleString()} F</span>`;
      } else {
        feeHtml = `<span style="color: var(--text-sec); font-size:11px;">Non inscrit</span>`;
      }
      
      let teamBadge = m.team === 'A' ? `<span class="badge" style="background: var(--gold); color: var(--primary);">A</span>` : m.team === 'B' ? `<span class="badge" style="background: var(--accent-cyan); color: var(--primary);">B</span>` : '-';
      
      let duesPaid = appData.contributions.filter(c => c.memberId == m.id && c.type === "Cotisation Annuelle").reduce((sum, c) => sum + Number(c.amount), 0);
      let duesBadgeClass = duesPaid >= 25000 ? "badge-success" : duesPaid >= 15000 ? "badge-warning" : "badge-danger";
      const duesHtml = `<span class="badge ${duesBadgeClass}">${duesPaid.toLocaleString()} F</span>`;
      
      const statusHtml = duesPaid >= 25000 
        ? `<span class="badge badge-success">À jour</span>`
        : duesPaid >= 15000 
          ? `<span class="badge badge-warning">Partiel</span>`
          : `<span class="badge badge-danger">En retard</span>`;
      
      const actionsHtml = `<button class="btn btn-sm btn-secondary" onclick="openMemberModal('${m.id}')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteMember('${m.id}')"><i class="fas fa-trash"></i></button>`;
      
      tbody.innerHTML += `<tr>
        <td><div class="member-cell"><div class="avatar">${avatarHtml}</div><div class="member-info"><span class="member-name">${getFullName(m)} ${captainBadge} ${goalkeeperBadge}</span><span class="member-role">${m.profession || '-'}</span>${feeHtml}</div></div></td>
        <td>${m.dob || '-'}</td>
        <td>${teamBadge}</td>
        <td>${duesHtml}</td>
        <td>${statusHtml}</td>
        <td style="text-align:right;">${actionsHtml}</td>
      </tr>`;
    });
}

function openMemberModal(id = null) {
  document.getElementById('memberModalTitle').innerText = id ? 'Modifier Membre' : 'Nouveau Membre';
  document.getElementById('memberId').value = id || '';
  if (id) {
    const m = appData.members.find(x => x.id == id);
    if (!m) return;
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
  } else {
    document.querySelectorAll('#memberModal input, #memberModal select').forEach(el => el.value = '');
    document.getElementById('memberStatut').value = 'Actif';
  }
  openModal('memberModal');
}

async function saveMember() {
  const id = document.getElementById('memberId').value;
  const photoInput = document.getElementById('memberPhoto');
  const existingMember = id ? appData.members.find(m => m.id == id) : {};
  
  let photoUrl = existingMember.photo || "";
  
  if (photoInput && photoInput.files && photoInput.files[0]) {
    showToast('Upload photo...', false);
    const file = photoInput.files[0];
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    const { error: uploadError } = await supabaseClient.storage.from('photos').upload(fileName, file);
    if (uploadError) {
      showToast('Erreur upload: ' + uploadError.message, true);
      return;
    }
    
    const { data: { publicUrl } } = supabaseClient.storage.from('photos').getPublicUrl(fileName);
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
    const res = await supabaseClient.from('membres').update(dbData).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseClient.from('membres').insert([dbData]).select();
    error = res.error;
  }

  if (error) {
    console.error('Erreur sauvegarde:', error);
    showToast('Erreur: ' + error.message, true);
  } else {
    showToast('Membre enregistré !', false);
    closeModal('memberModal');
    await loadData();
  }
}

async function deleteMember(id) {
  if (confirm('Supprimer ce membre ?')) {
    const { error } = await supabaseClient.from('membres').delete().eq('id', id);
    if (error) {
      showToast('Erreur: ' + error.message, true);
    } else {
      showToast('Membre supprimé !', false);
      await loadData();
    }
  }
}

// ============================================
// BUREAU
// ============================================
function renderBureau() {
  const container = document.getElementById('bureauContainer');
  if (!container) return;
  container.innerHTML = '';
  const boardMembers = appData.members.filter(m => m.fonction && m.fonction !== "");
  if (boardMembers.length === 0) {
    container.innerHTML = `<p style="color: var(--text-sec); text-align: center; grid-column: 1/-1;">Aucun membre du bureau désigné.</p>`;
    return;
  }
  const roleOrder = ["Président", "Vice Président", "Secrétaire Général", "Secrétaire Général Adjoint", "Trésorier", "Commissaire aux comptes", "Censeur N°1", "Censeur N°2", "Chargé des Sports et de la Culture", "Conseiller Spécial"];
  boardMembers.sort((a, b) => roleOrder.indexOf(a.fonction) - roleOrder.indexOf(b.fonction));
  boardMembers.forEach(m => {
    const roleKey = roleTranslationMap[m.fonction] || 'none';
    const translatedRole = translations[roleKey] ? translations[roleKey][currentLang] : m.fonction;
    const initials = `${(m.firstName||'').charAt(0)}${(m.lastName||'').charAt(0)}`;
    const photoHtml = m.photo ? `<img src="${m.photo}" alt="${m.firstName}">` : initials;
    container.innerHTML += `<div class="org-card"><div class="org-card-banner"></div><div class="org-card-content"><div class="org-avatar-lg">${photoHtml}</div><h3 style="margin-top: 15px; font-weight: 800;">${getFullName(m)}</h3><div class="org-role-badge">${translatedRole}</div>${m.phone ? `<p style="font-size: 13px;"><i class="fas fa-phone"></i> ${m.phone}</p>` : ''}${m.email ? `<p style="font-size: 13px;"><i class="fas fa-envelope"></i> ${m.email}</p>` : ''}</div></div>`;
  });
}

// ============================================
// CONTRIBUTIONS
// ============================================
function renderContributions() {
  const searchMember = (document.getElementById('searchContribMember')?.value || '').toLowerCase();
  const searchHistory = (document.getElementById('searchContribHistory')?.value || '').toLowerCase();
  
  const summaryTbody = document.getElementById('contribTable');
  if (summaryTbody) {
    summaryTbody.innerHTML = '';
    const filteredMembers = getSortedMembers().filter(m => !searchMember || getFullName(m).toLowerCase().includes(searchMember));
    if (filteredMembers.length === 0) {
      summaryTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-sec); padding:20px;">Aucun membre trouvé.</td></tr>`;
    } else {
      filteredMembers.forEach(m => {
        const initials = `${(m.firstName||'').charAt(0)}${(m.lastName||'').charAt(0)}`;
        const avatarHtml = m.photo ? `<img src="${m.photo}" alt="${m.firstName}">` : initials;
        const duesPaid = appData.contributions.filter(c => c.memberId == m.id && c.type === "Cotisation Annuelle").reduce((sum, c) => sum + Number(c.amount), 0);
        const regPaid = appData.contributions.filter(c => c.memberId == m.id && (c.type === "Inscription" || c.type === "Réinscription")).reduce((sum, c) => sum + Number(c.amount), 0);
        let statusHtml = duesPaid >= 25000 ? `<span class="badge badge-success">À jour</span>` : duesPaid >= 15000 ? `<span class="badge badge-warning">Partiel</span>` : `<span class="badge badge-danger">En retard</span>`;
        const actionsHtml = `<button class="btn btn-sm btn-primary" onclick="openContribModal(); selectMemberForContrib('${m.id}')"><i class="fas fa-plus"></i></button>`;
        summaryTbody.innerHTML += `<tr><td><div class="member-cell"><div class="avatar">${avatarHtml}</div><div class="member-info"><span class="member-name">${getFullName(m)}</span></div></div></td><td>${duesPaid.toLocaleString()} F</td><td>${regPaid.toLocaleString()} F</td><td>${statusHtml}</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
      });
    }
  }
  
  const historyTbody = document.getElementById('contribHistoryTable');
  if (!historyTbody) return;
  historyTbody.innerHTML = '';
  const sortedContribs = [...appData.contributions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredContribs = sortedContribs.filter(c => {
    if (!searchHistory) return true;
    const member = appData.members.find(m => m.id == c.memberId);
    const name = member ? getFullName(member).toLowerCase() : 'unknown';
    return name.includes(searchHistory) || (c.type || '').toLowerCase().includes(searchHistory);
  });
  if (filteredContribs.length === 0) {
    historyTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-sec); padding:20px;">Aucune contribution trouvée.</td></tr>`;
  } else {
    filteredContribs.forEach(c => {
      const member = appData.members.find(m => m.id == c.memberId);
      const name = member ? getFullName(member) : 'Unknown';
      const actionsHtml = `<button class="btn btn-sm btn-danger" onclick="deleteContribution('${c.id}')"><i class="fas fa-trash"></i></button>`;
      historyTbody.innerHTML += `<tr><td>${c.date}</td><td>${name}</td><td>${Number(c.amount).toLocaleString()} F</td><td>${c.type}</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
    });
  }
}

function selectMemberForContrib(id) { document.getElementById('contribMember').value = id; }

function openContribModal() {
  document.querySelectorAll('#contribModal input, #contribModal select').forEach(el => el.value = '');
  document.getElementById('contribDate').valueAsDate = new Date();
  populateMemberSelects();
  openModal('contribModal');
}

async function saveContribution() {
  const id = document.getElementById('contribId').value;
  const dbData = {
    membre_id: document.getElementById('contribMember').value,
    montant: parseFloat(document.getElementById('contribMontant').value) || 0,
    date_paiement: document.getElementById('contribDate').value,
    type_paiement: document.getElementById('contribType').value
  };

  let error;
  if (id) {
    const res = await supabaseClient.from('contributions').update(dbData).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseClient.from('contributions').insert([dbData]).select();
    error = res.error;
  }

  if (error) {
    showToast("Erreur: " + error.message, true);
  } else {
    showToast('Contribution ajoutée !', false);
    closeModal('contribModal');
    await loadData();
  }
}

async function deleteContribution(id) {
  if (confirm("Supprimer cette contribution ?")) {
    const { error } = await supabaseClient.from('contributions').delete().eq('id', id);
    if (error) showToast("Erreur: " + error.message, true);
    else await loadData();
  }
}

// ============================================
// DÉPENSES
// ============================================
function renderExpenses() {
  const tbody = document.getElementById('expensesTable');
  if (!tbody) return;
  tbody.innerHTML = '';
  let totalExpenses = 0;
  appData.expenses.forEach(e => {
    totalExpenses += Number(e.amount);
    const actionsHtml = `<button class="btn btn-sm btn-danger" onclick="deleteExpense('${e.id}')"><i class="fas fa-trash"></i></button>`;
    tbody.innerHTML += `<tr><td>${e.date}</td><td>${e.reason}</td><td>${e.beneficiary || '-'}</td><td>${Number(e.amount).toLocaleString()} F</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
  });
  const totalExpensesEl = document.getElementById('totalExpensesYear');
  if (totalExpensesEl) totalExpensesEl.innerText = totalExpenses.toLocaleString();
  const netBalanceEl = document.getElementById('netBalanceExpenses');
  if (netBalanceEl) {
    const totalContribs = appData.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
    netBalanceEl.innerText = (totalContribs - totalExpenses).toLocaleString();
  }
}

function openExpenseModal(id = null) {
  document.querySelectorAll('#expenseModal input').forEach(el => el.value = '');
  if (!id) document.getElementById('expenseDate').valueAsDate = new Date();
  if (id) {
    const e = appData.expenses.find(x => x.id == id);
    if (!e) return;
    document.getElementById('expenseId').value = e.id;
    document.getElementById('expenseDate').value = e.date || '';
    document.getElementById('expenseMontant').value = e.amount || '';
    document.getElementById('expenseMotif').value = e.reason || '';
    document.getElementById('expenseBeneficiaire').value = e.beneficiary || '';
  }
  openModal('expenseModal');
}

async function saveExpense() {
  const id = document.getElementById('expenseId').value;
  const dbData = {
    montant: parseFloat(document.getElementById('expenseMontant').value) || 0,
    date_depense: document.getElementById('expenseDate').value,
    motif: document.getElementById('expenseMotif').value,
    beneficiaire: document.getElementById('expenseBeneficiaire').value
  };

  let error;
  if (id) {
    const res = await supabaseClient.from('depenses').update(dbData).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseClient.from('depenses').insert([dbData]).select();
    error = res.error;
  }

  if (error) {
    showToast("Erreur: " + error.message, true);
  } else {
    showToast('Dépense ajoutée !', false);
    closeModal('expenseModal');
    await loadData();
  }
}

async function deleteExpense(id) {
  if (confirm("Supprimer cette dépense ?")) {
    const { error } = await supabaseClient.from('depenses').delete().eq('id', id);
    if (error) showToast("Erreur: " + error.message, true);
    else await loadData();
  }
}

// ============================================
// SANCTIONS & ARBITRES
// ============================================
function renderSanctions() {
  const tbody = document.getElementById('sanctionsTable');
  if (!tbody) return;
  tbody.innerHTML = '';
  const search = (document.getElementById('searchSanctions')?.value || '').toLowerCase();
  const filteredSanctions = appData.sanctions.filter(s => {
    if (!search) return true;
    const member = appData.members.find(m => m.id == s.memberId);
    const name = member ? getFullName(member).toLowerCase() : 'unknown';
    return name.includes(search);
  });
  if (filteredSanctions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-sec); padding:20px;">Aucune sanction trouvée.</td></tr>`;
    return;
  }
  filteredSanctions.forEach(s => {
    const member = appData.members.find(m => m.id == s.memberId);
    const name = member ? getFullName(member) : 'Unknown';
    const total = Number(s.amount || 0), paid = Number(s.amountPaid || 0);
    const remaining = Math.max(0, total - paid);
    const isPaid = remaining === 0 && total > 0;
    let statusBadge = isPaid ? `<span class="badge badge-success">Payé</span>` : `<span class="badge badge-danger">Impayé</span>`;
    const actionsHtml = `<button class="btn btn-sm btn-secondary" onclick="paySanction('${s.id}')"><i class="fas fa-money-check-dollar"></i></button><button class="btn btn-sm btn-danger" onclick="deleteSanction('${s.id}')"><i class="fas fa-trash"></i></button>`;
    tbody.innerHTML += `<tr><td>${name}</td><td>${s.type}</td><td>${total.toLocaleString()} F</td><td>${paid.toLocaleString()} F</td><td>${remaining.toLocaleString()} F</td><td>${statusBadge}</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
  });
}

async function paySanction(id) {
  const s = appData.sanctions.find(x => x.id == id);
  if (!s) return;
  const total = Number(s.amount || 0), alreadyPaid = Number(s.amountPaid || 0);
  const remaining = total - alreadyPaid;
  const input = prompt(`Montant à encaisser (Reste: ${remaining} F)`, remaining);
  if (input !== null) {
    const amountToPay = Number(input);
    if (!isNaN(amountToPay) && amountToPay > 0) {
      const newPaid = alreadyPaid + amountToPay;
      const { error } = await supabaseClient.from('sanctions').update({ montant_paye: newPaid }).eq('id', id);
      if (error) showToast("Erreur: " + error.message, true);
      else {
        showToast('Paiement enregistré !', false);
        await loadData();
      }
    }
  }
}

async function deleteSanction(id) {
  if (confirm("Supprimer cette sanction ?")) {
    const { error } = await supabaseClient.from('sanctions').delete().eq('id', id);
    if (error) showToast("Erreur: " + error.message, true);
    else {
      showToast('Sanction supprimée !', false);
      await loadData();
    }
  }
}

function openSanctionModal(id = null) {
  document.querySelectorAll('#sanctionModal input, #sanctionModal select, #sanctionModal textarea').forEach(el => el.value = '');
  populateMemberSelects();
  if (id) {
    const s = appData.sanctions.find(x => x.id == id);
    if (!s) return;
    document.getElementById('sanctionId').value = s.id;
    document.getElementById('sanctionPlayer').value = s.memberId;
    document.getElementById('sanctionType').value = s.type;
    document.getElementById('sanctionAmount').value = s.amount;
    document.getElementById('sanctionDate').value = s.date;
    document.getElementById('sanctionMotif').value = s.reason;
  }
  openModal('sanctionModal');
}

async function saveSanction() {
  const id = document.getElementById('sanctionId').value;
  const dbData = {
    joueur_id: document.getElementById('sanctionPlayer').value,
    type_sanction: document.getElementById('sanctionType').value,
    montant: parseFloat(document.getElementById('sanctionAmount').value) || 0,
    date_sanction: document.getElementById('sanctionDate').value,
    motif: document.getElementById('sanctionMotif').value
  };

  let error;
  if (id) {
    const res = await supabaseClient.from('sanctions').update(dbData).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseClient.from('sanctions').insert([dbData]).select();
    error = res.error;
  }

  if (error) {
    showToast("Erreur: " + error.message, true);
  } else {
    showToast('Sanction enregistrée !', false);
    closeModal('sanctionModal');
    await loadData();
  }
}

function renderArbitres() {
  const tbody = document.getElementById('arbitresTable');
  if (!tbody) return;
  tbody.innerHTML = '';
  const search = (document.getElementById('searchArbitres')?.value || '').toLowerCase();
  const filteredReferees = appData.referees.filter(r => {
    if (!search) return true;
    return (r.name || '').toLowerCase().includes(search);
  });
  if (filteredReferees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-sec); padding:20px;">Aucun arbitre trouvé.</td></tr>`;
    return;
  }
  filteredReferees.forEach(r => {
    const matchCount = appData.matches.filter(m => m.refereeCentral == r.name || m.judge1 == r.name || m.judge2 == r.name).length;
    const initials = (r.name || '?').split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
    const avatarHtml = r.photo ? `<img src="${r.photo}" alt="${r.name}">` : initials;
    const actionsHtml = `<button class="btn btn-sm btn-danger" onclick="deleteArbitre('${r.id}')"><i class="fas fa-trash"></i></button>`;
    tbody.innerHTML += `<tr><td><div class="member-cell"><div class="avatar">${avatarHtml}</div><div class="member-info"><span class="member-name">${r.name || '-'}</span></div></div></td><td>${r.phone || '-'}</td><td>${matchCount}</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
  });
}

function openArbitreModal(id = null) {
  document.querySelectorAll('#arbitreModal input').forEach(el => el.value = '');
  if (id) {
    const r = appData.referees.find(x => x.id == id);
    if (!r) return;
    document.getElementById('arbitreId').value = r.id;
    document.getElementById('arbitreNom').value = r.name || '';
    document.getElementById('arbitreTel').value = r.phone || '';
    document.getElementById('arbitreEmail').value = r.email || '';
  }
  openModal('arbitreModal');
}

async function saveArbitre() {
  const id = document.getElementById('arbitreId').value;
  const dbData = {
    nom: document.getElementById('arbitreNom').value,
    tel: document.getElementById('arbitreTel').value,
    email: document.getElementById('arbitreEmail').value
  };

  let error;
  if (id) {
    const res = await supabaseClient.from('arbitres').update(dbData).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseClient.from('arbitres').insert([dbData]).select();
    error = res.error;
  }

  if (error) {
    showToast("Erreur: " + error.message, true);
  } else {
    showToast('Arbitre enregistré !', false);
    closeModal('arbitreModal');
    await loadData();
  }
}

async function deleteArbitre(id) {
  if (confirm("Supprimer cet arbitre ?")) {
    const { error } = await supabaseClient.from('arbitres').delete().eq('id', id);
    if (error) showToast("Erreur: " + error.message, true);
    else {
      showToast('Arbitre supprimé !', false);
      await loadData();
    }
  }
}

// ============================================
// INFIRMERIE
// ============================================
function renderInfirmerie() {
  const tbody = document.getElementById('infirmerieTable');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (appData.injuries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-sec); padding:20px;">Aucune blessure enregistrée.</td></tr>`;
    return;
  }
  appData.injuries.forEach(b => {
    const member = appData.members.find(m => m.id == b.memberId);
    const name = member ? getFullName(member) : 'Unknown';
    let daysLeftText = '-';
    if (b.date && b.duration && b.status === "En soin") {
      const injuryDate = new Date(b.date);
      const today = new Date();
      const endDate = new Date(injuryDate);
      endDate.setDate(injuryDate.getDate() + Number(b.duration));
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      daysLeftText = daysLeft > 0 ? `<span style="color: #ff0033; font-weight: 800;">${daysLeft} j</span>` : `<span style="color: var(--gold-dark); font-weight: 800;">0 j</span>`;
    } else if (b.status === "Guéri" || b.status === "Reprise") {
      daysLeftText = `<span style="color: var(--gold-dark); font-weight: 800;">Terminé</span>`;
    }
    let statusBadge = b.status === "En soin" ? `<span class="badge badge-warning">En soin</span>` : b.status === "Guéri" ? `<span class="badge badge-success">Guéri</span>` : `<span class="badge badge-info">Reprise</span>`;
    const actionsHtml = `<button class="btn btn-sm btn-danger" onclick="deleteBlessure('${b.id}')"><i class="fas fa-trash"></i></button>`;
    tbody.innerHTML += `<tr><td>${name}</td><td>${b.type || '-'}</td><td>${b.date || '-'}</td><td>${b.duration || '-'} j</td><td>${daysLeftText}</td><td>${statusBadge}</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
  });
}

function openBlessureModal(id = null) {
  document.querySelectorAll('#blessureModal input, #blessureModal select').forEach(el => el.value = '');
  populateMemberSelects();
  if (id) {
    const b = appData.injuries.find(x => x.id == id);
    if (!b) return;
    document.getElementById('blessureId').value = b.id;
    document.getElementById('blessurePlayer').value = b.memberId;
    document.getElementById('blessureType').value = b.type || '';
    document.getElementById('blessureDuree').value = b.duration || '';
    document.getElementById('blessureDate').value = b.date || '';
    document.getElementById('blessureStatut').value = b.status || 'En soin';
  } else {
    document.getElementById('blessureDate').valueAsDate = new Date();
  }
  openModal('blessureModal');
}

async function saveBlessure() {
  const id = document.getElementById('blessureId').value;
  const dbData = {
    joueur_id: document.getElementById('blessurePlayer').value,
    type_blessure: document.getElementById('blessureType').value,
    duree_jours: parseInt(document.getElementById('blessureDuree').value) || null,
    date_blessure: document.getElementById('blessureDate').value,
    statut: document.getElementById('blessureStatut').value
  };

  let error;
  if (id) {
    const res = await supabaseClient.from('blessures').update(dbData).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseClient.from('blessures').insert([dbData]).select();
    error = res.error;
  }

  if (error) {
    showToast("Erreur: " + error.message, true);
  } else {
    showToast('Blessure enregistrée !', false);
    closeModal('blessureModal');
    await loadData();
  }
}

async function deleteBlessure(id) {
  if (confirm("Supprimer cette blessure ?")) {
    const { error } = await supabaseClient.from('blessures').delete().eq('id', id);
    if (error) showToast("Erreur: " + error.message, true);
    else {
      showToast('Blessure supprimée !', false);
      await loadData();
    }
  }
}

// ============================================
// ÉQUIPES & MATCHS
// ============================================
function renderTeams() {
  const teamACount = appData.members.filter(m => m.team === 'A').length;
  const teamBCount = appData.members.filter(m => m.team === 'B').length;
  const el = (id) => document.getElementById(id);
  if (el('teamACount')) el('teamACount').innerText = teamACount;
  if (el('teamBCount')) el('teamBCount').innerText = teamBCount;

  const teamACaptains = appData.members.filter(m => m.team === 'A' && m.isCaptain);
  const teamBCaptains = appData.members.filter(m => m.team === 'B' && m.isCaptain);

  let captainsAHtml = teamACaptains.length === 0 ? `<span style="color:var(--text-sec);">-</span>` : '';
  teamACaptains.forEach(m => { captainsAHtml += `<div style="display:flex; align-items:center; gap:8px; background:var(--bg-main); padding:6px 10px; border-radius:6px; font-size:13px;"><span style="color:#ca8a04; font-weight:900;">(C)</span> ${getFullName(m)}</div>`; });
  if (el('teamACaptains')) el('teamACaptains').innerHTML = captainsAHtml;

  let captainsBHtml = teamBCaptains.length === 0 ? `<span style="color:var(--text-sec);">-</span>` : '';
  teamBCaptains.forEach(m => { captainsBHtml += `<div style="display:flex; align-items:center; gap:8px; background:var(--bg-main); padding:6px 10px; border-radius:6px; font-size:13px;"><span style="color:#ca8a04; font-weight:900;">(C)</span> ${getFullName(m)}</div>`; });
  if (el('teamBCaptains')) el('teamBCaptains').innerHTML = captainsBHtml;

  let manOfMatchCounts = {};
  appData.matches.forEach(m => { if (m.manOfMatch) { manOfMatchCounts[m.manOfMatch] = (manOfMatchCounts[m.manOfMatch] || 0) + 1; } });
  let bestPlayerId = null, maxVotes = 0;
  for (const id in manOfMatchCounts) { if (manOfMatchCounts[id] > maxVotes) { maxVotes = manOfMatchCounts[id]; bestPlayerId = id; } }
  if (bestPlayerId) {
    const player = appData.members.find(m => m.id == bestPlayerId);
    if (player) {
      if (el('bestPlayerName')) el('bestPlayerName').innerText = getFullName(player);
      if (el('bestPlayerVotes')) el('bestPlayerVotes').innerText = `${maxVotes} désignations`;
    }
  } else {
    if (el('bestPlayerName')) el('bestPlayerName').innerText = '-';
    if (el('bestPlayerVotes')) el('bestPlayerVotes').innerText = `0 désignations`;
  }

  let strikerCounts = {};
  appData.matches.forEach(m => {
    if (m.scorers) { m.scorers.split('\n').forEach(name => { const t = name.trim(); if (t) { strikerCounts[t] = (strikerCounts[t] || 0) + 1; } }); }
  });
  let bestStrikerName = '-', maxGoals = 0;
  for (const name in strikerCounts) { if (strikerCounts[name] > maxGoals) { maxGoals = strikerCounts[name]; bestStrikerName = name; } }
  if (el('bestStrikerName')) el('bestStrikerName').innerText = bestStrikerName;
  if (el('bestStrikerGoals')) el('bestStrikerGoals').innerText = `${maxGoals} buts`;

  const scorersRankingDiv = document.getElementById('scorersRanking');
  if (scorersRankingDiv) {
    let scorersArray = Object.keys(strikerCounts).map(name => ({ name, count: strikerCounts[name] })).sort((a, b) => b.count - a.count);
    if (scorersArray.length === 0) {
      scorersRankingDiv.innerHTML = `<p style="color:var(--text-sec); text-align:center;">Aucun but enregistré.</p>`;
    } else {
      scorersRankingDiv.innerHTML = '';
      scorersArray.forEach((s, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '' : `${index + 1}.`;
        scorersRankingDiv.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-main); padding:8px 12px; border-radius:6px;"><span style="font-weight:600;"><span style="margin-right:8px;">${medal}</span> ${s.name}</span><span style="background:var(--gold-dark); color:white; padding:2px 8px; border-radius:10px; font-size:12px;">${s.count}</span></div>`;
      });
    }
  }

  const assisterCounts = {};
  appData.matches.forEach(m => {
    if (m.assists) { m.assists.split('\n').forEach(name => { const t = name.trim(); if (t) { assisterCounts[t] = (assisterCounts[t] || 0) + 1; } }); }
  });
  const assistersRankingDiv = document.getElementById('assistersRanking');
  if (assistersRankingDiv) {
    let assistersArray = Object.keys(assisterCounts).map(name => ({ name, count: assisterCounts[name] })).sort((a, b) => b.count - a.count);
    if (assistersArray.length === 0) {
      assistersRankingDiv.innerHTML = `<p style="color:var(--text-sec); text-align:center;">Aucune passe enregistrée.</p>`;
    } else {
      assistersRankingDiv.innerHTML = '';
      assistersArray.forEach((a, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        assistersRankingDiv.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-main); padding:8px 12px; border-radius:6px;"><span style="font-weight:600;"><span style="margin-right:8px;">${medal}</span> ${a.name}</span><span style="background:var(--accent-cyan); color:var(--primary); padding:2px 8px; border-radius:10px; font-size:12px;">${a.count}</span></div>`;
      });
    }
  }

  let winsJeunes = 0, winsVeterans = 0;
  appData.matches.filter(m => m.type === 'intergeneration').forEach(m => {
    const score1 = Number(m.score1 || 0), score2 = Number(m.score2 || 0);
    if (score1 > score2) winsJeunes++;
    else if (score2 > score1) winsVeterans++;
  });
  if (el('winsJeunes')) el('winsJeunes').innerText = winsJeunes;
  if (el('winsVeterans')) el('winsVeterans').innerText = winsVeterans;
  let championName = '-';
  if (winsJeunes > winsVeterans) championName = 'Jeunes';
  else if (winsVeterans > winsJeunes) championName = 'Vétérans';
  if (el('championName')) el('championName').innerText = championName;
}

function toggleMatchSortOrder() {
  matchSortOrder = matchSortOrder === 'asc' ? 'desc' : 'asc';
  updateMatchSortButton();
  renderMatches();
}

function updateMatchSortButton() {
  const btn = document.getElementById('matchSortBtn');
  const label = document.getElementById('matchSortLabel');
  if (btn && label) {
    if (matchSortOrder === 'asc') {
      btn.innerHTML = `<i class="fas fa-sort-amount-down"></i> <span id="matchSortLabel">Plus ancien d'abord</span>`;
    } else {
      btn.innerHTML = `<i class="fas fa-sort-amount-up"></i> <span id="matchSortLabel">Plus récent d'abord</span>`;
    }
  }
}

function renderMatches() {
  const hebdoTbody = document.getElementById('matchesHebdoTable');
  if (hebdoTbody) {
    hebdoTbody.innerHTML = '';
    const hebdoMatches = appData.matches
      .filter(m => m.type === 'hebdomadaire')
      .sort((a, b) => {
        const dateA = new Date(a.date || '1970-01-01');
        const dateB = new Date(b.date || '1970-01-01');
        return matchSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    
    if (hebdoMatches.length === 0) {
      hebdoTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Aucun match hebdomadaire.</td></tr>`;
    } else {
      hebdoMatches.forEach(m => {
        const member = appData.members.find(mem => mem.id == m.manOfMatch);
        const momName = member ? getFullName(member) : '-';
        const actionsHtml = `<button class="btn btn-sm btn-secondary" onclick="openMatchModal('${m.id}')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteMatch('${m.id}')"><i class="fas fa-trash"></i></button>`;
        hebdoTbody.innerHTML += `<tr><td>${m.date || '-'}</td><td>${m.score1 || 0} - ${m.score2 || 0}</td><td style="font-size: 12px;">${m.scorers || '-'}</td><td>${momName}</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
      });
    }
  }
  
  const intergenTbody = document.getElementById('matchesIntergenTable');
  if (intergenTbody) {
    intergenTbody.innerHTML = '';
    const intergenMatches = appData.matches.filter(m => m.type === 'intergeneration');
    
    if (intergenMatches.length === 0) {
      intergenTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Aucun match intergénération.</td></tr>`;
    } else {
      intergenMatches.forEach(m => {
        let winner = '-';
        if (Number(m.score1) > Number(m.score2)) winner = 'Jeunes';
        else if (Number(m.score2) > Number(m.score1)) winner = 'Vétérans';
        else winner = 'Match Nul';
        const actionsHtml = `<button class="btn btn-sm btn-secondary" onclick="openMatchModal('${m.id}')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteMatch('${m.id}')"><i class="fas fa-trash"></i></button>`;
        intergenTbody.innerHTML += `<tr><td>${m.trimester || '-'}</td><td>${m.date || '-'}</td><td>${m.score1 || 0} - ${m.score2 || 0}</td><td>${winner}</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
      });
    }
  }
  
  const amicalTbody = document.getElementById('matchesAmicalTable');
  if (amicalTbody) {
    amicalTbody.innerHTML = '';
    const amicalMatches = appData.matches.filter(m => m.type === 'amical');
    
    if (amicalMatches.length === 0) {
      amicalTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">Aucun match amical.</td></tr>`;
    } else {
      amicalMatches.forEach(m => {
        const actionsHtml = `<button class="btn btn-sm btn-secondary" onclick="openMatchModal('${m.id}')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteMatch('${m.id}')"><i class="fas fa-trash"></i></button>`;
        amicalTbody.innerHTML += `<tr><td>${m.date || '-'}</td><td>${m.opponent || '-'}</td><td>${m.score1 || 0} - ${m.score2 || 0}</td><td style="text-align:right;">${actionsHtml}</td></tr>`;
      });
    }
  }
}

function openMatchModal(id = null, type = null) {
  document.querySelectorAll('#matchModal input, #matchModal select, #matchModal textarea').forEach(el => el.value = '');
  populateMemberSelects();
  if (id) {
    const m = appData.matches.find(x => x.id == id);
    if (!m) return;
    document.getElementById('matchId').value = m.id;
    document.getElementById('matchType').value = m.type || 'hebdomadaire';
    document.getElementById('matchDate').value = m.date || '';
    document.getElementById('matchTrimestre').value = m.trimester || '1';
    document.getElementById('matchAdversaire').value = m.opponent || '';
    document.getElementById('matchScore1').value = m.score1 || 0;
    document.getElementById('matchScore2').value = m.score2 || 0;
    document.getElementById('matchHommeMatch').value = m.manOfMatch || '';
    document.getElementById('matchRefereeCentral').value = m.refereeCentral || '';
    document.getElementById('matchCommissioner').value = m.commissioner || '';
    document.getElementById('matchJudge1').value = m.judge1 || '';
    document.getElementById('matchJudge2').value = m.judge2 || '';
    document.getElementById('matchScorers').value = m.scorers || '';
    document.getElementById('matchAssists').value = m.assists || '';
    document.getElementById('matchSheet1').value = m.sheet1 || '';
    document.getElementById('matchSheet2').value = m.sheet2 || '';
  } else if (type) {
    document.getElementById('matchType').value = type;
    document.getElementById('matchDate').valueAsDate = new Date();
  }
  openModal('matchModal');
}

async function saveMatch() {
  const id = document.getElementById('matchId').value;
  const dbData = {
    type_match: document.getElementById('matchType').value,
    date_match: document.getElementById('matchDate').value,
    trimestre: parseInt(document.getElementById('matchTrimestre').value) || null,
    adversaire: document.getElementById('matchAdversaire').value,
    score1: parseInt(document.getElementById('matchScore1').value) || 0,
    score2: parseInt(document.getElementById('matchScore2').value) || 0,
    homme_match_id: document.getElementById('matchHommeMatch').value || null,
    arbitre_central: document.getElementById('matchRefereeCentral').value,
    commissaire: document.getElementById('matchCommissioner').value,
    juge1: document.getElementById('matchJudge1').value,
    juge2: document.getElementById('matchJudge2').value,
    buteurs: document.getElementById('matchScorers').value,
    passeurs: document.getElementById('matchAssists').value,
    feuille_match1: document.getElementById('matchSheet1').value,
    feuille_match2: document.getElementById('matchSheet2').value
  };

  let error;
  if (id) {
    const res = await supabaseClient.from('matchs').update(dbData).eq('id', id);
    error = res.error;
  } else {
    const res = await supabaseClient.from('matchs').insert([dbData]).select();
    error = res.error;
  }

  if (error) {
    showToast("Erreur: " + error.message, true);
  } else {
    showToast('Match enregistré !', false);
    closeModal('matchModal');
    await loadData();
  }
}

async function deleteMatch(id) {
  if (confirm("Supprimer ce match ?")) {
    const { error } = await supabaseClient.from('matchs').delete().eq('id', id);
    if (error) showToast("Erreur: " + error.message, true);
    else {
      showToast('Match supprimé !', false);
      await loadData();
    }
  }
}

// ============================================
// LICENCES
// ============================================
function renderLicencePreview() {
  const select = document.getElementById('licencePlayer');
  const memberId = select?.value;
  const previewDiv = document.getElementById('licencePreview');
  if (!memberId || !previewDiv) { if (previewDiv) previewDiv.classList.add('hidden'); return; }
  const m = appData.members.find(x => x.id == memberId);
  if (!m) return;
  previewDiv.classList.remove('hidden');
  const photoEl = document.getElementById('licencePhoto');
  if (photoEl) photoEl.src = m.photo || '';
  const nameEl = document.getElementById('licenceName');
  if (nameEl) nameEl.innerText = getFullName(m);
  const dobEl = document.getElementById('licenceDob');
  if (dobEl) dobEl.innerText = m.dob || '-';
  const ageEl = document.getElementById('licenceAge');
  if (ageEl) ageEl.innerText = calculateAge(m.dob);
  const posteEl = document.getElementById('licencePoste');
  if (posteEl) posteEl.innerText = m.position || '-';
  const numeroEl = document.getElementById('licenceNumero');
  if (numeroEl) numeroEl.innerText = m.number || '-';
  const catEl = document.getElementById('licenceCategorie');
  if (catEl) catEl.innerText = m.category || '-';
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const seasonEl = document.getElementById('licenceSeason');
  if (seasonEl) seasonEl.innerText = `${currentYear}/${nextYear}`;
  const dateEl = document.getElementById('licenceDate');
  if (dateEl) dateEl.innerText = new Date().toLocaleDateString();
}

function generateLicencePDF() {
  const element = document.getElementById('licencePreview');
  if (!element || element.classList.contains('hidden')) {
    showToast("Veuillez d'abord sélectionner un membre.", true);
    return;
  }
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set({ margin: 0, filename: 'licence.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(element).save();
  } else {
    showToast("html2pdf non chargé", true);
  }
}

// ============================================
// RELEVÉ MEMBRE
// ============================================
function renderMemberStatement() {
  const select = document.getElementById('statementMemberSelect');
  const memberId = select?.value;
  const memberInfoDiv = document.getElementById('statementMemberInfo');
  if (!memberId) {
    if (memberInfoDiv) memberInfoDiv.classList.add('hidden');
    const tbody = document.getElementById('statementTable');
    if (tbody) tbody.innerHTML = '';
    return;
  }
  const m = appData.members.find(x => x.id == memberId);
  if (!m) return;
  if (memberInfoDiv) memberInfoDiv.classList.remove('hidden');
  const photoEl = document.getElementById('statementPhoto');
  if (photoEl) photoEl.src = m.photo || '';
  const nameEl = document.getElementById('statementName');
  if (nameEl) nameEl.innerText = getFullName(m);
  const ageEl = document.getElementById('statementAge');
  if (ageEl) ageEl.innerText = `${calculateAge(m.dob)} ans`;

  const duesPaid = appData.contributions.filter(c => c.memberId == m.id && c.type === "Cotisation Annuelle").reduce((sum, c) => sum + Number(c.amount), 0);
  const insPaid = appData.contributions.filter(c => c.memberId == m.id && (c.type === "Inscription" || c.type === "Réinscription")).reduce((sum, c) => sum + Number(c.amount), 0);
  const duesTarget = 25000;
  let insTarget = 0;
  if (m.statutAdhesion === 'inscription') insTarget = 10000;
  else if (m.statutAdhesion === 'reinscription') insTarget = 5000;
  
  const totalPaidEl = document.getElementById('statementTotalPaid');
  if (totalPaidEl) totalPaidEl.innerText = `${duesPaid.toLocaleString()} F`;
  const cotRestEl = document.getElementById('statementCotisationRestant');
  if (cotRestEl) cotRestEl.innerText = `Reste: ${Math.max(0, duesTarget - duesPaid).toLocaleString()} F`;
  const insPaidEl = document.getElementById('statementInscriptionPaid');
  if (insPaidEl) insPaidEl.innerText = `${insPaid.toLocaleString()} F`;
  const insRestEl = document.getElementById('statementInscriptionRestant');
  if (insRestEl) insRestEl.innerText = `Reste: ${Math.max(0, insTarget - insPaid).toLocaleString()} F`;

  const tbody = document.getElementById('statementTable');
  if (!tbody) return;
  tbody.innerHTML = '';
  const memberContribs = appData.contributions.filter(c => c.memberId == m.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  if (memberContribs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-sec);">Aucune transaction trouvée.</td></tr>`;
  } else {
    memberContribs.forEach(c => {
      tbody.innerHTML += `<tr><td>${c.date}</td><td>${c.type}</td><td>${Number(c.amount).toLocaleString()} F</td><td>-</td></tr>`;
    });
  }
}

function clearMemberHistory() {
  const select = document.getElementById('statementMemberSelect');
  if (select) select.value = "";
  const memberInfoDiv = document.getElementById('statementMemberInfo');
  if (memberInfoDiv) memberInfoDiv.classList.add('hidden');
  const tbody = document.getElementById('statementTable');
  if (tbody) tbody.innerHTML = '';
}

// ============================================
// BILAN ANNUEL
// ============================================
function renderAnnualReport() {
  const totalRevenue = appData.contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const totalExpenses = appData.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netBalance = totalRevenue - totalExpenses;
  const el = (id) => document.getElementById(id);
  if (el('reportTotalRevenue')) el('reportTotalRevenue').innerText = totalRevenue.toLocaleString();
  if (el('reportTotalExpenses')) el('reportTotalExpenses').innerText = totalExpenses.toLocaleString();
  if (el('reportNetBalance')) el('reportNetBalance').innerText = netBalance.toLocaleString();
}

// ============================================
// STATUT & RÈGLEMENT
// ============================================
function toggleEditDocs() {
  const viewMode = document.getElementById('docsViewMode');
  const editMode = document.getElementById('docsEditMode');
  if (viewMode) viewMode.classList.toggle('hidden');
  if (editMode) editMode.classList.toggle('hidden');
}

async function saveOfficialDocs() {
  const statut = document.getElementById('statutInput').value;
  const reglement = document.getElementById('reglementInput').value;
  
  await supabaseClient.from('parametres').upsert({ cle: 'statut', valeur: statut });
  await supabaseClient.from('parametres').upsert({ cle: 'reglement', valeur: reglement });
  
  appData.officialDocs.statut = statut;
  appData.officialDocs.reglement = reglement;
  
  renderOfficialDocs();
  toggleEditDocs();
  showToast('Documents enregistrés !', false);
}

function renderOfficialDocs() {
  const statutContent = document.getElementById('statutContent');
  const reglementContent = document.getElementById('reglementContent');
  const statutInput = document.getElementById('statutInput');
  const reglementInput = document.getElementById('reglementInput');
  if (statutContent) statutContent.innerText = appData.officialDocs.statut || 'Aucun statut enregistré.';
  if (reglementContent) reglementContent.innerText = appData.officialDocs.reglement || 'Aucun règlement enregistré.';
  if (statutInput) statutInput.value = appData.officialDocs.statut || '';
  if (reglementInput) reglementInput.value = appData.officialDocs.reglement || '';
}

// ============================================
// PARAMÈTRES & SELECTS
// ============================================
function populateMemberSelects() {
  const selects = ['contribMember', 'sanctionPlayer', 'blessurePlayer', 'licencePlayer', 'statementMemberSelect', 'matchHommeMatch', 'scorerSelect', 'assisterSelect'];
  const sortedMembers = getSortedMembers();
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      const currentValue = select.value;
      select.innerHTML = `<option value="">Sélectionner un membre</option>`;
      sortedMembers.forEach(m => { select.innerHTML += `<option value="${m.id}">${getFullName(m)}</option>`; });
      select.value = currentValue;
    }
  });
  const yearSelect = document.getElementById('statementYearFilter');
  if (yearSelect) {
    const currentYearValue = yearSelect.value;
    const years = [...new Set(appData.contributions.map(c => c.date ? c.date.substring(0, 4) : null).filter(y => y))].sort((a,b) => b.localeCompare(a));
    yearSelect.innerHTML = `<option value="">Toutes années</option>`;
    years.forEach(y => { yearSelect.innerHTML += `<option value="${y}">${y}</option>`; });
    yearSelect.value = currentYearValue;
  }
}

function saveSettings() {
  const name = document.getElementById('settingNom').value;
  appData.settings.name = name || 'ACABA 2#0';
  supabaseClient.from('parametres').upsert({ cle: 'nom_association', valeur: appData.settings.name });
  applySettings();
  showToast('Paramètres enregistrés !', false);
}

function resetData() {
  if (confirm("Voulez-vous vraiment tout effacer ?")) {
    localStorage.removeItem('acaba_data');
    appData = { members: [], contributions: [], expenses: [], sanctions: [], referees: [], matches: [], injuries: [], officialDocs: { statut: "", reglement: "" }, settings: { name: "ACABA 2#0", logo: "" } };
    renderAll();
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = "acaba_data_export.json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Données exportées !', false);
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData.members && Array.isArray(importedData.members)) {
        if (confirm("Cela remplacera toutes les données actuelles. Continuer ?")) {
          if (importedData.members.length > 0) {
            const membersToInsert = importedData.members.map(m => ({
              nom: m.lastName || m.nom || '',
              prenom: m.firstName || m.prenom || '',
              date_naissance: m.dob || null,
              lieu_naissance: m.pob || '',
              sexe: m.gender || 'Masculin',
              situation: m.civilStatus || '',
              profession: m.profession || '',
              fonction_bureau: m.fonction || '',
              categorie: m.category || 'Jeune',
              statut_adhesion: m.statutAdhesion || 'aucun',
              equipe: m.team || 'A',
              capitaine: m.isCaptain || false,
              poste: m.position || '',
              numero: parseInt(m.number) || null,
              tel: m.phone || '',
              email: m.email || '',
              adresse: m.address || '',
              photo_url: m.photo || '',
              statut_membre: m.status || 'Actif'
            }));
            await supabaseClient.from('membres').insert(membersToInsert);
          }
          await loadData();
          showToast("Données importées avec succès !", false);
        }
      } else {
        showToast("Fichier JSON invalide.", true);
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur de lecture du fichier.", true);
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function downloadAppFile() {
  showToast('Utilisez Ctrl+S pour sauvegarder.', false);
}

function appendToList(select, textareaId) {
  const textarea = document.getElementById(textareaId);
  if (select.value && textarea) {
    textarea.value += (textarea.value ? '\n' : '') + select.options[select.selectedIndex].text;
    select.value = "";
  }
}

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('ACABA 2#0 - Initialisation...');
  const arbitreModalBody = document.querySelector('#arbitreModal .modal-body');
  if (arbitreModalBody && !document.getElementById('arbitrePhoto')) {
    arbitreModalBody.insertAdjacentHTML('beforeend', `<div class="form-group" style="margin-top:15px;"><label data-i18n="photo">Photo</label><input type="file" id="arbitrePhoto" accept="image/*" class="form-control"></div>`);
  }
  applyTranslations();
  checkMobileView();
  loadData();
});
