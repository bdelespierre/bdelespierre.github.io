---
layout: post
type: article
title: Lumen et les sessions
date: 2016-11-07
category: article
tags: ["laravel", "lumen"]
description:
spritzable: no
tldr: no
image: /images/articles/lumen.png
---

Lumen est un [micro-framework](https://en.wikipedia.org/wiki/Microframework) fabriqué avec des bouts de [Laravel](https://laravel.com/) dedans. Il est léger, souple et convient parfaitement à la réalisation d'API en [RAD](https://en.wikipedia.org/wiki/Rapid_application_development). Avec Lumen, c'est vite fait, bien fait. Perso j'adore mais depuis le passage de la version 5.1 à la 5.2, le framework a changé d'orientation pour se dédier exclusivement aux API. Donc exit le templating avec [Blade](https://laravel.com/docs/5.3/blade) et exit aussi les __Sessions__.

Moi ça me rend un peu triste: autant je peux facillement m'accomoder de perdre Blade, autant ne plus avoir de support pour les sessions est gênant car j'aime parfois avoir une interface d'admin bundlée avec mon API et donc j'ai besoin d'authentifier mes utilisateurs et avec des cookies c'est bien plus simple.

Aujourd'hui on va donc voir comment récuppérer le support des session avec Laravel 5.3.

## Etape 1: installation de Lumen

Hop, on saute direct dans notre terminal et on fait:

{% highlight bash %}
>_lumen new session-project
Crafting application...
Application ready! Build something amazing.
{% endhighlight %}

Si vous n'avez pas encore la commande lumen, allez faire un tour sur [la doc d'installation](https://lumen.laravel.com/docs/5.3/installation), c'est super simple ;)

Puis on créé le fichier .env qui va bien:

{% highlight bash %}
>_cd session-project
>_cp .env.example .env
{% endhighlight %}

Ensuite on lance le serveur avec:

{% highlight bash %}
>_php -S localhost:8000 -t public/
PHP 7.0.8-0ubuntu0.16.04.3 Development Server started at Mon Nov  7 16:26:34 2016
Listening on http://localhost:8000
Document root is /home/benjamin/Laboratory/session-project/public
Press Ctrl-C to quit.
{% endhighlight %}

## Etape 2: la vue

Ça c'était la partie facile. On va commencer par créer une vue pour se logger, on créé donc un fichier `resources\views\login.php` avec ça:

{% highlight html linenos %}
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/lumen/bootstrap.min.css" rel="stylesheet" integrity="sha384-gv0oNvwnqzF6ULI9TVsSmnULNb3zasNysvWwfT/s4l8k5I+g6oFz9dye0wg3rQ2Q" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <title>Login</title>
</head>
<body>
    <div class="container">
        <div class="col-md-6 col-md-offset-3">
            <div class="well connection">
                <h3>Connexion</h3>
                <hr>
                <form action="" method="post">
                    <div class="form-group">
                        <label for="input-email">Email</label>
                        <input type="text" name="email" id="input-email" class="form-control" placeholder="utilisateur@mon-domaine.fr">
                    </div>
                    <div class="form-group">
                        <label for="input-password">Mot de passe</label>
                        <input type="password" name="password" id="input-password" class="form-control">
                    </div>
                    <button class="btn btn-primary" type="submit"><i class="glyphicon glyphicon-ok"></i> Se connecter</button>
                </form>
            </div>
        </div>
    </div>
</body>
</html>
{% endhighlight %}

Voilà donc un formulaire d'authentification des plus simples mais qui a quand même de la gueule (merci [Bootstrap](http://getbootstrap.com/) d'aider les non-créatifs comme moi à s'en sortir dans la vie de dév web.)

Pour faire bonne mesure, on créé aussi la route `/login` associée dans `routes/web.php`:

{% highlight php linenos %}
<?php

// ...

$app->get('/login', function () {
    return view('login');
});
{% endhighlight %}

On va sur [http://localhost:8000/login](http://localhost:8000/login) et voilà, ça en jette non ?

## Etape 3: la même chose mais en POST

Donc maintenant c'est là que ça devient marrant: on va récuppérer les infos POST du formulaire pour logguer notre utilisateur. Créons déjà la route qui va bien:

{% highlight php linenos %}
<?php

// ...

use Illuminate\Http\Request;

$app->post('/login', function (Request $request) {
    if ($request->has('email', 'password')) {
        Session::set('user', $request->only('email', 'password'));
    }

    return redirect('/');
});
{% endhighlight %}

Pour le moment on va pas s'amuser avec une vraie authentification base de données toussa toussa, on s'en tiend aux sessions donc on va juste stocker les infos reçues du formulaire sur la session.

Une fois que c'est fait, on retourne dans notre navigateur, on rentre des trucs dans le formulaire et là, c'est le drame:

    Whoops, looks like something went wrong.

    1/1
    FatalThrowableError in web.php line 26:
    Class 'Session' not found

Eh oui, la façade Session n'existe pas... En même temps c'était prévu.

## Etape 4: la façade Session

Le truc marrant avec Lumen c'est que certaines façades existent mais ne sont tout simplement pas bindées. On va régler ça dans `bootstrap/app.php` on va commencer par remplacer la ligne 26:

{% highlight php %}
// $app->withFacades();
{% endhighlight %}

par

{% highlight php %}
$app->withFacades(true, [
    Illuminate\Support\Facades\Session::class => "Session",
]);
{% endhighlight %}

Donc maintenant la classe Session est dispo, mais on ne peux pas encore s'en servir. Si on retourne dans le browser on voit que l'erreur à changé:

    Whoops, looks like something went wrong.

    1/1
    FatalThrowableError in Facade.php line 237:
    Call to undefined method Illuminate\Support\Facades\Session::set()

Ça c'est le signe que la façade n'est pas correctement fournie. Il faut dire à Lumen quelle instance concrête utiliser pour la façade et ça c'est le boulot d'un provider.

## Etape 5: le provider

On va créer un nouveau provider pour notre façade session qu'on va sobrement appeller SessionServiceProvider (quelle originalité !) Ça se passe dans `/app/providers/SessionServiceProvider.php`

{% highlight php linenos %}
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Support\Session;

class SessionServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('session', function ($app) {
            return $app->make(Session::class);
        });
    }
}
{% endhighlight %}

On notera qu'ici la classe Session est une interface (Illuminate\Contracts\Support\Session), c'est le job du conteneur ($app) de déterminer quelle est l'instance concrête à fournir pour cette interface mais pour ça il faut le lui dire. Donc on retourne dans `bootstrap/app.php` et à la ligne 52 on ajoute:

    $app->singleton(
        Illuminate\Contracts\Support\Session::class,
        Symfony\Component\HttpFoundation\Session\Session::class
    );

De cette façon, Lumen sait que quand on lui demande de fabriquer avec $app->make une session, il doit créer une instance de Symfony\Component\HttpFoundation\Session\Session. Cette classe fait partie du composant [HttpFoundation](https://github.com/symfony/http-foundation) de [Symfony](https://symfony.com/) et est nativement disponible à l'installation de Lumen.

Il faut aussi penser à déclarer le provider. Toujours dans `bootstrap/app.php` ligne 91 on ajoute:

    $app->register(App\Providers\SessionServiceProvider::class);

Maintenant on peut retourner sur notre browser et voir qu'à la soumission du formulaire on est bien redirigé vers l'index, ce qui est cool. Pourquoi ne pas afficher ce que la session contiend tant qu'on est là ? Modifions la route d'index dans `routes/web.php`:

{% highlight php linenos %}
<?php

$app->get('/', function () {
    dd(Session::all());
});
{% endhighlight %}

Cool, on a notre façade qui marche bien.

## Etape 6: le middleware

Le truc __vraiment__ frais avec Laravel ce sont les middlewares. Lumen est d'ailleurs nativement fourni avec un middleware d'authentification qu'on peut utiliser pour nos routes. Configurons le pour qu'il utilise nos sessions fraîchement configurées. Le middleware fourni par défaut est déjà bien, il renvoie une 401 si l'utilisateur n'est pas correctement authentifié. En revanche on va devoir modifier le fournisseur du service d'authentification si on veut que ça marche correctement avec nos sessions. On va donc ouvrir `app/Providers/AuthProvider.php` et changer la méthode `boot` en:

{% highlight php linenos %}
<?php

    // ...

    public function boot()
    {
        $this->app['auth']->viaRequest('api', function ($request) {
            return $request->session()->has('user') ? $request->session()->get('user') : null;
        });
    }
{% endhighlight %}

Et là c'est un peu différent, on n'a pas utilisé directement la façade Session mais on a pris la session de la requête (ce qui est un poil plus propre à mon avis). Seulement voilà les requêtes crées par Lumen n'ont pas de session par défaut. Mais c'est pas grave on va leur en donner une. Pour ça on va se servir des évènements du conteneur pour injecter l'instance de Session à la requête après sa création. Dans `bootstrap/app.php` ligne 57 on va ajouter:

    $app->resolving(Illuminate\Http\Request::class, function ($request, $app) {
        $request->setSession($app->session);
    });

Comme ça l'injection est correctement faite. On en profite au passage pour décommenter la ligne 93 ainsi que les lignes 77 à 79 du même fichier:

    77: $app->routeMiddleware([
    78:    'auth' => App\Http\Middleware\Authenticate::class,
    79: ]);
    ...
    95: $app->register(App\Providers\SessionServiceProvider::class);
    96: $app->register(App\Providers\AuthServiceProvider::class);

Attention à l'ordre: le SessionServiceProvider __doit__ être chargé avant l'AuthServiceProvider sinon c'est le mauvais binding qui est fait et ça ne marche plus.

On n'a plus qu'a créer une route de logout et une route protégée et le tour est joué. Dans `routes/web.php` ajoutons:

{% highlight php linenos %}
<?php

// ...

$app->get('/admin', ['middleware' => 'auth', function () {
    return "Access granted !";
}]);

$app->get('/logout', function () {
    Session::clear();
    return redirect('/');
});
{% endhighlight %}

Et c'est gagné !

## Conclusion

Tout au long de cet article, nous n'avons fait que du binding et nous n'avons pour ainsi dire rien codé nous même. Le support des sessions et de l'authentification était déjà là, nous n'avons eu qu'a l'activer pour que tout fonctionne normalement. Au final cela nous a permi de jouer avec le conteneur et l'injection de dépendances de Lumen et je l'éspère vous aura permi de mieux comprendre les mécanismes de ce framework.

J'espère sincèrement que cet article vous a plu, je vous laisse [une copie du projet complet](https://github.com/bdelespierre/lumen-session-demo) sur GitHub pour votre plus grand plaisir, n'hésitez pas à la commenter.
