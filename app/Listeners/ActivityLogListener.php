<?php

namespace App\Listeners;

use App\Models\RegistroActividad;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Request;

class ActivityLogListener
{
    public function handleLogin(Login $event)
    {
        $this->log($event->user->id, 'login', "El usuario inició sesión");
    }

    public function handleLogout(Logout $event)
    {
        if ($event->user) {
            $this->log($event->user->id, 'logout', "El usuario cerró sesión");
        }
    }

    public function handleFailed(Failed $event)
    {
        $email = $event->credentials['email'] ?? 'desconocido';
        $this->log(null, 'login_failed', "Intento de inicio de sesión fallido para el correo: {$email}");
    }

    protected function log($userId, $action, $description)
    {
        RegistroActividad::create([
            'user_id' => $userId ?? 1, // Default to system/admin if null
            'model_type' => 'Auth',
            'model_id' => 0,
            'action' => $action,
            'description' => $description,
            'url' => Request::fullUrl(),
            'method' => Request::method(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    public function subscribe($events)
    {
        return [
            Login::class => 'handleLogin',
            Logout::class => 'handleLogout',
            Failed::class => 'handleFailed',
        ];
    }
}
