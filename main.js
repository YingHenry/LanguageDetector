
/*

Etape 0:
--------

Structure des données

ngrams = [[{a: 2, b: 0, c: 5, ...}, // monogram langue 0
		   {ab: 9, bc: 6, cd: 4, ...}, // bigram langue 0
		   {abc: 1, bcd: 8, cde: 4, ...}], // trigram langue 0

		  [{a: 2, b: 0, c: 5, ...}, // monogram langue 1
		   {ab: 9, bc: 6, cd: 4, ...}, // bigram langue 1
		   {abc: 1, bcd: 8, cde: 4, ...}], // trigram langue 1

		  ...
		  ...
		  ...

		  [{a: 2, b: 0, c: 5, ...}, // monogram langue n-1
		   {ab: 9, bc: 6, cd: 4, ...}, // bigram langue n-1
		   {abc: 1, bcd: 8, cde: 4, ...}] // trigram langue n-1
		 ];

ngrams est un tableau à n éléments. n est le nombre de langues

ngrams[i] est un tableau qui contient 3 objets. Ce sont les listes des monograms, des bigrams et des trigrams.

ngrams[i][j] est une liste de ngrams dont les valeurs sont le nombre d'apparition

ngrams[i][j][ngram] est le nombre d'apparition d'un ngram

Etape 1:
--------
On fait la liste des mono, bi et trigrams pour chaque langue.
Pour chaque ngram on compte le nombre d'apparitions.

Exemple: (espace représenté par tiret bas)
'Le chat'
Monograms: L, e, _, c, h, a, t
Bigrams: Le, e_, _c, ch, ha, at
Trigrams: Le_, e_c, _ch, cha, hat

Etape 2:
--------
Une fois qu'on le nombre d'apparition de tous les mono, bi et trigrams de chaque langue on calcule leur pourcentage d'apparition.

pourcentage = nombre d'apparition du ngram / nombre total de ngrams

Calcul du nombre total de ngrams dans un texte:
nombre total de ngrams = nombre total de caractères - (n-1)

Exemple:
Dans le texte 'Le chat' il y a 7 caractères.
nombre total de monograms = 7 - (1-1) = 7
nombre total de bigrams = 7 - (2-1) = 6
nombre total de trigrams = 7 - (3-1) = 5

Plutôt que de créer un nouveau tableau pour les pourcentages on va remplacer les nombres d'apparitions. On a comme ça qu'une seule grosse variable et on évite d'encombrer la mémoire.

Pour déterminer la langue d'une chaîne de caractères il va falloir multiplier les pourcentages. Il y a un problème: les nombres deviennent vite très petits et donc peu lisibles. On utilise alors les logarithmes népériens.

ln(a*b) = ln(a) + ln(b)
Avec cette propriété on fait des additions, ce qui va donner des nombres beaucoup plus lisibles. Si le ngram n'existe pas on n'ajoute rien.

Etape 3
-------
On détermine la langue d'un mot en le décomposant en ngrams. On additionne le logarithme de chaque n gram et on compare les totaux. La langue qui a le total le plus faible (puisqu'on additionne des négatifs) devrait être la bonne langue.

*/

const LANGUAGES_TOTAL = 6;
const NGRAMS = 5;

// Etape 1:
// --------

// cette fonction le ngram à la position i d'une chaîne
function getNgram(text, i, n){
	var ngram = '';
	for(var j = 0; j < n; j++){
		ngram += text[i + j];
	}

	return ngram;
}

function createNgramsList(text, n){
	var ngramTotal = text.length - (n-1);
	var ngramsList = {};
	var ngram = '';

	for(var i = 0; i < ngramTotal; i++){

		ngram = getNgram(text, i, n);

		if(ngramsList[ngram]){
			ngramsList[ngram]++;
		}else{
			ngramsList[ngram] = 1;
		}
	}

	return ngramsList;
}

function createAllNgramsLists(ngrams){
	for(var i = 0; i < LANGUAGES_TOTAL; i++){
		ngrams[i] = [];

		for(var j = 0; j < NGRAMS; j++){
			ngrams[i][j] = createNgramsList(text[i], j+1);
		}
	}
}

// Etape 2:
// --------

// calcul du nombre total de ngrams dans chaque texte
function calculateNgram(ngrams){
	var ngramsTotal = [];

	for(var i = 0; i < LANGUAGES_TOTAL; i++){
		ngramsTotal[i] = [];
		for(var j = 0; j < NGRAMS; j++){
			ngramsTotal[i][j] = text[i].length - j;
		}
	}

	for(var i = 0; i < LANGUAGES_TOTAL; i++){
		for(var j = 0; j < NGRAMS; j++){
			for(var id in ngrams[i][j]){
				ngrams[i][j][id] /= ngramsTotal[i][j]; // calcul du pourcentage
				ngrams[i][j][id] = Math.log(ngrams[i][j][id]); // calcul du logarithme
			}
		}
	}
}

// Etape 3:
// --------

// calcul de la probabilité d'une phrase
function sentenceProbability(sentence, ngrams){
	// on découpe la phrase en ngram
	var sentenceLength = sentence.length;
	var probability = [];
	var ngram;

	for(var i = 0; i < LANGUAGES_TOTAL; i++){
		probability[i] = [];
		for(var j = 0; j < NGRAMS; j++){
			probability[i][j] = 0;

			for(var k = 0; k < sentenceLength-(j-1); k++){

				ngram = getNgram(sentence, k, j+1);

				// on récupère la probabilité 
				if(ngrams[i][j][ngram]){
					//console.log(probability[i][j]);
					probability[i][j] += ngrams[i][j][ngram];
					//console.log(ngrams[i][j][ngram]);
					//console.log('probability[i][j]: ' + probability[i][j]);
					//console.log(' ');
				}
			}
		}
	}
	return probability;
}

function updateUserInput(ngrams){
	// on récupère ce que l'utilisateur a écrit
	var textAreaObject = document.querySelector('textarea');

	textAreaObject.addEventListener('keyup', function(){
		text = textAreaObject.value;

		// petite astuce pour avoir de meilleurs résultats: on ajoute un espace pour indiquer qu'on a écrit un mot en entier

		var probability = sentenceProbability(text + ' ', ngrams);

		var lowest, languageDetected;

		for(var j = NGRAMS-1; j >= 0; j--){
			lowest = 0;
			languageDetected = 0;

			// on essaye de trouver la langue la plus probable avec le ngram le plus élevé
			for(var i = 0; i < LANGUAGES_TOTAL; i++){
				// la langue probable est celle qui a le nombre le plus faible 
				if(probability[i][j] < lowest){
					lowest = probability[i][j];
					languageDetected = i;
				}
			}

			// dans le cas où le plus bas est à 0, cela signifie que l'on n'a pas trouvé de ngrams pour toutes les langues. Il est nécessaire d'aller au ngram inférieur. Dans le cas contraire on sort de la boucle
			if(lowest != 0){
				break;
			}			
		}

		var resultObject = document.querySelector('#result');

		var result = 'La langue détectée est ';

		switch(languageDetected){
			case 0: 
				result += 'le français.';
				break;
			case 1: 
				result += 'l\'anglais.';
				break;
			case 2: 
				result += 'l\'espagnol.';
				break;					
			case 3: 
				result += 'le portugais.';
				break;				
			case 4: 
				result += 'l\'italien.';
				break;
			case 5: 
				result += 'l\'allemand.';
				break;											
		}

		// si l'utilisateur n'a rien rentré on n'affiche rien
		if(text == ''){
			result = '';
		}else{
			if(text.length == 1){
				result = text.length + ' caractère. ' + result;
			}else{
				result = text.length + ' caractères. ' + result;
			}
		}

		resultObject.innerHTML = result;
	});
}

document.addEventListener('DOMContentLoaded', function(){
	var ngrams = [];

	createAllNgramsLists(ngrams);

	calculateNgram(ngrams);
	console.log(ngrams); // on affiche dans la console les ngrams

	updateUserInput(ngrams);
});