// Variables globales
let passwordsGenerated = 0;

// Caractères pour la génération
const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Mots de passe courants (les plus utilisés)
const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
    'master', 'shadow', 'jesus', 'michael', 'superman', 'hello',
    'charlie', 'aa123456', 'donald', 'password1', 'qwerty123'
];

// Éléments DOM
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');
const generateBtn = document.getElementById('generate-btn');
const generatedPassword = document.getElementById('generated-password');
const copyBtn = document.getElementById('copy-btn');
const passwordInput = document.getElementById('password-input');
const toggleVisibility = document.getElementById('toggle-visibility');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');
const lengthCheck = document.getElementById('length-check');
const crackTime = document.getElementById('crack-time');
const entropy = document.getElementById('entropy');
const passwordsGeneratedEl = document.getElementById('passwords-generated');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Slider de longueur
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // Génération automatique quand on change les paramètres
    lengthSlider.addEventListener('input', generatePassword);
    uppercaseCheck.addEventListener('change', generatePassword);
    lowercaseCheck.addEventListener('change', generatePassword);
    numbersCheck.addEventListener('change', generatePassword);
    symbolsCheck.addEventListener('change', generatePassword);

    // Bouton générer
    generateBtn.addEventListener('click', generatePassword);

    // Copier le mot de passe
    copyBtn.addEventListener('click', copyPassword);

    // Analyse en temps réel
    passwordInput.addEventListener('input', function() {
        analyzePassword(this.value);
    });

    // Basculer visibilité mot de passe
    toggleVisibility.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Génération initiale
    generatePassword();
});

// Fonction de génération de mot de passe
function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let availableChars = '';

    // Construire le jeu de caractères
    if (uppercaseCheck.checked) availableChars += charset.uppercase;
    if (lowercaseCheck.checked) availableChars += charset.lowercase;
    if (numbersCheck.checked) availableChars += charset.numbers;
    if (symbolsCheck.checked) availableChars += charset.symbols;

    // Vérifier qu'au moins un type est sélectionné
    if (availableChars === '') {
        generatedPassword.value = 'Sélectionnez au moins un type de caractère';
        return;
    }

    // Générer le mot de passe
    let password = '';
    
    // S'assurer qu'au moins un caractère de chaque type sélectionné est inclus
    if (uppercaseCheck.checked) password += getRandomChar(charset.uppercase);
    if (lowercaseCheck.checked) password += getRandomChar(charset.lowercase);
    if (numbersCheck.checked) password += getRandomChar(charset.numbers);
    if (symbolsCheck.checked) password += getRandomChar(charset.symbols);

    // Compléter avec des caractères aléatoires
    for (let i = password.length; i < length; i++) {
        password += getRandomChar(availableChars);
    }

    // Mélanger le mot de passe
    password = shuffleString(password);

    // Afficher le résultat
    generatedPassword.value = password;

    // Incrémenter le compteur
    passwordsGenerated++;
    passwordsGeneratedEl.textContent = passwordsGenerated;

    // Analyser automatiquement le mot de passe généré
    analyzePassword(password);

    // Animation du bouton
    animateButton(generateBtn);
}

// Fonction pour obtenir un caractère aléatoire
function getRandomChar(str) {
    return str.charAt(Math.floor(Math.random() * str.length));
}

// Fonction pour mélanger une chaîne
function shuffleString(str) {
    return str.split('').sort(() => Math.random() - 0.5).join('');
}

// Fonction de copie
function copyPassword() {
    if (generatedPassword.value && generatedPassword.value !== 'Sélectionnez au moins un type de caractère') {
        navigator.clipboard.writeText(generatedPassword.value).then(() => {
            // Animation de succès
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.background = 'rgba(0, 255, 157, 0.3)';
            copyBtn.style.borderColor = '#00ff9d';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.background = 'rgba(0, 212, 255, 0.2)';
                copyBtn.style.borderColor = '#00d4ff';
            }, 1000);
        });
    }
}

// Fonction d'analyse de mot de passe
function analyzePassword(password) {
    if (!password) {
        resetAnalysis();
        return;
    }

    const analysis = {
        length: password.length,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSymbols: /[^A-Za-z0-9]/.test(password),
        isCommon: commonPasswords.includes(password.toLowerCase())
    };

    // Calculer le score de force (0-100)
    let score = 0;
    let feedback = [];

    // Longueur
    if (analysis.length >= 12) score += 25;
    else if (analysis.length >= 8) score += 15;
    else if (analysis.length >= 6) score += 10;
    else feedback.push('Trop court (minimum 12 caractères)');

    // Diversité des caractères
    if (analysis.hasUppercase) score += 15;
    else feedback.push('Ajouter des majuscules');

    if (analysis.hasLowercase) score += 15;
    else feedback.push('Ajouter des minuscules');

    if (analysis.hasNumbers) score += 15;
    else feedback.push('Ajouter des chiffres');

    if (analysis.hasSymbols) score += 20;
    else feedback.push('Ajouter des symboles');

    // Pénalités
    if (analysis.isCommon) {
        score = Math.max(0, score - 50);
        feedback.push('Mot de passe trop commun !');
    }

    // Patterns répétitifs
    if (hasRepetitivePattern(password)) {
        score = Math.max(0, score - 20);
        feedback.push('Éviter les répétitions');
    }

    // Calculer l'entropie
    const entropyValue = calculateEntropy(password);

    // Temps de crack estimé
    const crackTimeValue = calculateCrackTime(password, entropyValue);

    // Mettre à jour l'interface
    updateStrengthMeter(score);
    updateAnalysisDetails(analysis, entropyValue, crackTimeValue);
    updateSecurityTips(feedback);
}

// Calculer l'entropie
function calculateEntropy(password) {
    let charset = 0;
    if (/[a-z]/.test(password)) charset += 26;
    if (/[A-Z]/.test(password)) charset += 26;
    if (/\d/.test(password)) charset += 10;
    if (/[^A-Za-z0-9]/.test(password)) charset += 32;

    return Math.log2(Math.pow(charset, password.length));
}

// Calculer le temps de crack
function calculateCrackTime(password, entropy) {
    // Supposons 1 milliard de tentatives par seconde
    const attemptsPerSecond = 1e9;
    const possibleCombinations = Math.pow(2, entropy);
    const secondsTocrack = possibleCombinations / (2 * attemptsPerSecond);

    if (secondsTocrack < 1) return 'Instantané';
    if (secondsTocrack < 60) return `${Math.round(secondsTocrack)} secondes`;
    if (secondsTocrack < 3600) return `${Math.round(secondsTocrack / 60)} minutes`;
    if (secondsTocrack < 86400) return `${Math.round(secondsTocrack / 3600)} heures`;
    if (secondsTocrack < 31536000) return `${Math.round(secondsTocrack / 86400)} jours`;
    if (secondsTocrack < 31536000000) return `${Math.round(secondsTocrack / 31536000)} années`;
    return 'Des millénaires';
}

// Détecter les patterns répétitifs
function hasRepetitivePattern(password) {
    // Caractères répétés
    if (/(.)\1{2,}/.test(password)) return true;
    
    // Séquences (123, abc)
    for (let i = 0; i < password.length - 2; i++) {
        const char1 = password.charCodeAt(i);
        const char2 = password.charCodeAt(i + 1);
        const char3 = password.charCodeAt(i + 2);
        
        if (char2 === char1 + 1 && char3 === char2 + 1) return true;
    }
    
    return false;
}

// Mettre à jour la barre de force
function updateStrengthMeter(score) {
    strengthFill.style.width = `${score}%`;
    
    let text = '';
    let color = '';
    
    if (score < 30) {
        text = 'Très faible';
        color = '#ff4757';
    } else if (score < 50) {
        text = 'Faible';
        color = '#ff6b7a';
    } else if (score < 70) {
        text = 'Moyen';
        color = '#ffa500';
    } else if (score < 90) {
        text = 'Fort';
        color = '#32cd32';
    } else {
        text = 'Très fort';
        color = '#00ff9d';
    }
    
    strengthText.textContent = text;
    strengthText.style.color = color;
    strengthFill.style.background = `linear-gradient(90deg, #ff4757, ${color})`;
}

// Mettre à jour les détails d'analyse
function updateAnalysisDetails(analysis, entropyValue, crackTimeValue) {
    lengthCheck.textContent = `${analysis.length} caractères`;
    entropy.textContent = `${Math.round(entropyValue)} bits`;
    crackTime.textContent = crackTimeValue;
    
    // Couleurs selon la qualité
    lengthCheck.style.color = analysis.length >= 12 ? '#00ff9d' : '#ff6b7a';
    entropy.style.color = entropyValue >= 50 ? '#00ff9d' : '#ffa500';
}

// Mettre à jour les conseils
function updateSecurityTips(feedback) {
    const tipsList = document.getElementById('tips-list');
    
    if (feedback.length === 0) {
        tipsList.innerHTML = '<li style="color: #00ff9d;">✅ Excellent mot de passe !</li>';
    } else {
        tipsList.innerHTML = feedback.map(tip => `<li>${tip}</li>`).join('');
    }
}

// Réinitialiser l'analyse
function resetAnalysis() {
    strengthFill.style.width = '0%';
    strengthText.textContent = 'Tapez un mot de passe';
    strengthText.style.color = '#b0b0b0';
    lengthCheck.textContent = '0 caractères';
    entropy.textContent = '0 bits';
    crackTime.textContent = '-';
    
    const tipsList = document.getElementById('tips-list');
    tipsList.innerHTML = `
        <li>Utilisez au moins 12 caractères</li>
        <li>Mélangez majuscules, minuscules, chiffres et symboles</li>
        <li>Évitez les mots du dictionnaire</li>
        <li>N'utilisez pas d'informations personnelles</li>
    `;
}

// Animation des boutons
function animateButton(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);
}
