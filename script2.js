// ============================================
// CONFIGURATION SUPABASE
// ============================================
const SUPABASE_URL = 'https://gajleiddneqwzbrzahgh.supabase.co';
const SUPABASE_KEY = 'COLLEZ_VOTRE_PUBLISHABLE_KEY_ICI'; // ⚠️ Remplacez par votre clé complète
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// DICTIONNAIRE i18n
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
    "member-statement": { fr: "Relevé Membre", en: "Member Statement" },
    "annual-report": { fr: "Bilan Annuel", en: "Annual Report" },
    "official-docs": { fr: "Statut & Règlement", en: "Rules & Regulations" },
    "share-app": { fr: "Partager", en: "Share" },
    "settings": { fr: "Paramètres", en: "Settings" },
    "active_members": { fr: "Membres actifs", en: "Active Members" },
    "cfa_collected": { fr: "CFA collectés", en: "CFA Collected" },
    "matches_played": { fr: "Matchs joués", en: "Matches Played" },
    "next_match": { fr: "Prochain match", en: "Next Match" },
    "contributions_evolution": { fr: "Évolution des Contributions", en: "Contributions Evolution" },
    "distribution_category": { fr: "Répartition par Catégorie", en: "Distribution by Category" },
    "achievement_rate": { fr: "Taux de Réalisation (Cotisations Annuelles)", en: "Achievement Rate (Annual Dues)" },
    "up_to_date": { fr: "À jour", en: "Up to date" },
    "partial": { fr: "Partiel", en: "Partial" },
    "late": { fr: "En retard", en: "Late" },
    "member_management": { fr: "Gestion des Membres", en: "Member Management" },
    "new_member": { fr: "Nouveau Membre", en: "New Member" },
    "search_member": { fr: "Rechercher un membre...", en: "Search a member..." },
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
    "status_member": { fr: "Statut du Membre", en: "Member Status" },
    "active": { fr: "Actif", en: "Active" },
    "inactive": { fr: "Inactif", en: "Inactive" },
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
    "nominations": { fr: "0 désignations", en: "0 nominations" },
    "top_striker": { fr: "Meilleur Buteur de l'Année", en: "Top Scorer of the Year" },
    "goals": { fr: "0 buts", en: "0 goals" },
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
    "storage_warning": { fr: "Si la barre est rouge, l'application ne peut plus sauvegarder. Cliquez sur \"Réinitialiser\" pour vider la mémoire.", en: "If the bar is red, the app cannot save. Click \"Reset\" to clear memory." },
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
    "member_saved": { fr: "Membre enregistré avec succès !", en: "Member saved successfully!" },
    "contribution_saved": { fr: "Contribution ajoutée avec succès !", en: "Contribution added successfully!" },
    "expense_saved": { fr: "Dépense ajoutée avec succès !", en: "Expense added successfully!" },
    "settings_saved": { fr: "Paramètres enregistrés !", en: "Settings saved successfully!" },
    "no_board_members": { fr: "Aucun membre du bureau désigné. Ajoutez une fonction à un membre.", en: "No board members designated. Add a role to a member." },
    "unregistered_status": { fr: "Non inscrit", en: "Unregistered" },
    "member_deleted": { fr: "Membre supprimé avec succès !", en: "Member deleted successfully!" },
    "age": { fr: "Âge", en: "Age" },
    "cards": { fr: "Cartons (Année)", en: "Cards (Year)" },
    "member_details": { fr: "Fiche du Membre", en: "Member Details" },
    "sanction_saved": { fr: "Sanction enregistrée avec succès !", en: "Sanction saved successfully!" },
    "referee_saved": { fr: "Arbitre enregistré avec succès !", en: "Referee saved successfully!" },
    "sanction_deleted": { fr: "Sanction supprimée !", en: "Sanction deleted!" },
    "referee_deleted": { fr: "Arbitre supprimé !", en: "Referee deleted!" },
    "match_saved": { fr: "Match enregistré avec succès !", en: "Match saved successfully!" },
    "match_deleted": { fr: "Match supprimé !", en: "Match deleted!" },
    "injury_saved": { fr: "Blessure enregistrée avec succès !", en: "Injury saved successfully!" },
    "injury_deleted": { fr: "Blessure supprimée !", en: "Injury deleted!" },
    "docs_saved": { fr: "Documents enregistrés avec succès !", en: "Documents saved successfully!" },
    "no_injuries": { fr: "Aucun joueur actuellement à l'infirmerie.", en: "No players currently in the infirmary." },
    "injured_players": { fr: "Joueurs à l'Infirmerie", en: "Injured Players" },
    "view_sanctions": { fr: "Aperçu Sanctions", en: "View Sanctions" },
    "pay_sanction": { fr: "Encaisser", en: "Pay" },
    "payment_saved": { fr: "Paiement enregistré !", en: "Payment recorded!" },
    "no_sanctions": { fr: "Aucune sanction enregistrée.", en: "No sanctions recorded." },
    "sanctions_of": { fr: "Sanctions de", en: "Sanctions of" },
    "data_exported": { fr: "Données exportées avec succès !", en: "Data exported successfully!" },
    "download_app_msg": { fr: "Pour télécharger l'application, veuillez utiliser la fonction 'Enregistrer sous' (Ctrl+S) de votre navigateur pour sauvegarder la page complète.", en: "To download the app, please use your browser's 'Save As' feature (Ctrl+S) to save the complete page." },
    "storage_full": { fr: "Mémoire pleine ! Supprimez des photos ou exportez/importez les données pour libérer de l'espace.", en: "Memory full! Delete photos or export/import data to free up space." },
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

let currentLang = localStorage.getItem('acaba_lang') || 'fr';
let matchSortOrder = 'asc';

let appData = {
    members: [], contributions: [], expenses: [], sanctions: [],
    referees: [], matches: [], injuries: [],
    officialDocs: { statut: "", reglement: "" },
    settings: { name: "ACABA", logo: "" }
};

let contribChartInstance = null;
let categoryChartInstance = null;

// ============================================
// CHARGEMENT DES DONNÉES DEPUIS SUPABASE
// ============================================
async function loadData() {
    showToast(currentLang === 'fr' ? "Chargement des données..." : "Loading data...", false);
    
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
            supabase.from('membres').select('*'),
            supabase.from('contributions').select('*'),
            supabase.from('depenses').select('*'),
            supabase.from('sanctions').select('*'),
            supabase.from('arbitres').select('*'),
            supabase.from('matchs').select('*'),
            supabase.from('blessures').select('*'),
            supabase.from('parametres').select('cle, valeur')
        ]);

        if (errM) throw new Error("Erreur membres: " + errM.message);
        if (errC) throw new Error("Erreur contributions: " + errC.message);

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
        appData.settings.name = docs.find(d => d.cle === 'nom_association')?.valeur || "ACABA";
        appData.settings.logo = docs.find(d => d.cle === 'logo_url')?.valeur || "";

        renderAll();
        showToast(currentLang === 'fr' ? "Données chargées !" : "Data loaded!", false);
        
    } catch (error) {
        console.error("Erreur loadData:", error);
        showToast("Erreur de chargement: " + error.message, true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    applyTranslations();
    checkMobileView();
});

// ============================================
// SAUVEGARDE MEMBRE AVEC UPLOAD PHOTO
// ============================================
async function saveMember() {
    const id = document.getElementById('memberId').value;
    const photoInput = document.getElementById('memberPhoto');
    const existingMember = id ? appData.members.find(m => m.id == id) : {};
    
    let photoUrl = existingMember.photo || "";
    
    if (photoInput && photoInput.files && photoInput.files[0]) {
        showToast("Upload photo...", false);
        const file = photoInput.files[0];
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, file);

        if (uploadError) {
            showToast("Erreur upload photo: " + uploadError.message, true);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
        photoUrl = publicUrl;
    }

    const dbData = {
        nom: document.getElementById('memberNom').value,
        prenom: document.getElementById('memberPrenom').value,
        date_naissance: document.getElementById('memberDateNaissance').value,
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
        const res = await supabase.from('membres').insert(dbData).select();
        error = res.error;
    }

    if (error) {
        showToast("Erreur sauvegarde: " + error.message, true);
    } else {
        showToast(translations.member_saved[currentLang], false);
        closeModal('memberModal');
        await loadData();
    }
}

// ============================================
// SAUVEGARDE CONTRIBUTION
// ============================================
async function saveContribution() {
    const id = document.getElementById('contribId').value;
    const dbData = {
        membre_id: document.getElementById('contribMember').value,
        montant: parseFloat(document.getElementById('contribMontant').value),
        date_paiement: document.getElementById('contribDate').value,
        type_paiement: document.getElementById('contribType').value
    };

    let error;
    if (id) {
        const res = await supabase.from('contributions').update(dbData).eq('id', id);
        error = res.error;
    } else {
        const res = await supabase.from('contributions').insert(dbData).select();
        error = res.error;
    }

    if (error) {
        showToast("Erreur: " + error.message, true);
    } else {
        showToast(translations.contribution_saved[currentLang], false);
        closeModal('contribModal');
        await loadData();
    }
}

// ============================================
// SAUVEGARDE DÉPENSE
// ============================================
async function saveExpense() {
    const id = document.getElementById('expenseId').value;
    const dbData = {
        montant: parseFloat(document.getElementById('expenseMontant').value),
        date_depense: document.getElementById('expenseDate').value,
        motif: document.getElementById('expenseMotif').value,
        beneficiaire: document.getElementById('expenseBeneficiaire').value
    };

    let error;
    if (id) {
        const res = await supabase.from('depenses').update(dbData).eq('id', id);
        error = res.error;
    } else {
        const res = await supabase.from('depenses').insert(dbData).select();
        error = res.error;
    }

    if (error) {
        showToast("Erreur: " + error.message, true);
    } else {
        showToast(translations.expense_saved[currentLang], false);
        closeModal('expenseModal');
        await loadData();
    }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function closeModal(modalId) { 
    document.getElementById(modalId).classList.remove('flex'); 
}

function openModal(modalId) { 
    document.getElementById(modalId).classList.add('flex'); 
}

function showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.getElementById('langBtn').innerText = currentLang === 'fr' ? 'EN' : 'FR';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key] && translations[key][currentLang]) el.textContent = translations[key][currentLang];
    });
}

function checkMobileView() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) mobileBtn.style.display = window.innerWidth <= 1023 ? 'flex' : 'none';
}

function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    localStorage.setItem('acaba_lang', currentLang);
    applyTranslations();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.sidebar-link[data-tab="${tabId}"]`).classList.add('active');
    if (window.innerWidth <= 1023) document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() { 
    document.getElementById('sidebar').classList.toggle('open'); 
}

function renderAll() {
    // Fonctions de rendu à implémenter selon vos besoins
    console.log("Render all called");
}

// ============================================
// SUPPRESSION MEMBRE
// ============================================
async function deleteMember(id) {
    if (confirm(currentLang === 'fr' ? "Supprimer ce membre ?" : "Delete this member?")) {
        const { error } = await supabase.from('membres').delete().eq('id', id);
        if (error) {
            showToast("Erreur: " + error.message, true);
        } else {
            showToast(translations.member_deleted[currentLang], false);
            await loadData();
        }
    }
}