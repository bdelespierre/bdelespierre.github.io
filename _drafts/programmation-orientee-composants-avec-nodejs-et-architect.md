---
layout: post
type: article
title: Programmation orientée composants avec Node.js et Architect
date: 2014-08-20
category: article
tags: [javascript, node.js, architecture, programmation, architect, c9.io, orientee composants, orientee objet]
description: Comment construire une application Node.js flexible et modulaire avec Architect
---

<img src="http://bdelespierre.fr/images/articles/architect.jpg" alt="The Architect" style="float: right; margin: .5em 0 0 .5em"> [Node.js](http://nodejs.org/) est une plateforme qui m'a toujours fasciné depuis ses premières bétas. Sa philosophie, ses performances et sa simplicité m'ont rapidement sédui et d'après [Google Trends](http://www.google.com/trends/explore#q=nodejs) je ne suis pas le seul dans ce cas. Mais même si le gestionnaire de packets [NPM](https://www.npmjs.org/) est très efficace et très bien fait, construire une application complexe peut rapidement résulter en un enchevêtrement "spaghetti" de modules.

Importer des modules c'est bien, la réutilisation c'est objectivement cool. Pouvoir gêrer l'arborescende de dépendances des modules entre eux, centraliser leurs configurations et permettre de les [mocker](http://en.wikipedia.org/wiki/Mock_object) c'est encore mieux. C'est là que [l'injection de dépendances et la programmation orientée composants](http://bdelespierre.fr/article/injection-de-dependances-et-composants-en-php/) entrent en scène.

Il existe de nombreux injecteurs de dépendances pour Node.js et je vous renvoie à [l'article de Mario Casciaro](http://www.mariocasciaro.me/dependency-injection-in-node-js-and-other-architectural-patterns) qui en présente quelques uns parmi lesquels [Architect](https://github.com/c9/architect) de [Cloud9](https://c9.io/) sur lequel nous allons nous pencher aujourd'hui.

En quelques mots, Architect permet:

+ d'étendre la gestion native des modules en offrant la possibilité de définir les services exposés et consommés par un module
+ de centraliser dans un seul object les configuration des modules utilisables par l'application
+ de valider l'arbre dépendances entre les modules avant le démarage de l'application
+ de permettre le remplacement de services à des fins de tests (injection de mocks)
+ de permettre à plusieurs instances du même module de s'exécuter indépendamment dans le même processus

## Une application Architect

Architect n'est pas un simple injecteur de dépendances, c'est avant tout un tisseur qui assemble l'application à partir de modules (ou plugins). La notion de plugins est intéressante car, contrairement aux modules, elle suppose que les "pièce" de votre puzzle applicatif sont faites pour s'encastrer les unes dans les autres.

La structure de fichiers d'une application architect ressemble à ceci:

	/mon-projet
		/node_modules
		/plugins
			/foo
				foo.js
				package.json
			/bar
				/bar.js
				/package.json
		config.js
		server.js

On remarquera que chaque plugin contiens un fichier `package.json` comme tout module Node.js, c'est dans ce fichier qu'on mettra les services consommés (les dépendances) et exposés par le plugin.

La configuration `config.js` renvoie les plugins utilisés par l'application ainsi que leur configuration. Elle se présente de cette manière:

{% highlight javascript linenos %}
// config.js

module.exports = [
	'./plugins/foo',
	'./plugins/bar',
	{
		// exemple de plugin 'database' avec sa configuration
		packagePath: './plugin/database.js',
		host: 'localhost',
		user: 'root',
		password: 'root',
		database: 'test'
	}
];
{% endhighlight %}

La configuration ne décrit pas l'arbre de dépendance des modules et se contente de lister les modules utilisables par l'application et décrit leurs eventuelles options de configuration.

Démarer l'application avec Architect est réellement un jeu d'enfant:

{% highlight javascript linenos %}
// server.js

// dépendances
var path      = require("path");
var architect = require("architect");

// charger la configuration de l'application
var configPath = path.join(__dirname, "config.js");
var config = architect.loadConfig(configPath);

// démarrer l'application
architect.createApp(config, function(err, app) {

	// si un problème de dépendances est détecté, on s'arrête là
	if (err) throw err;

	// l'application est prête
	console.log("app ready");

	// et voici comment nous servir d'un plugin
	app.services.database.connect(function () {
		console.log("database ready");

		app.services.bar.doSomething();
	});

});
{% endhighlight %}

## Décrire un plugin

