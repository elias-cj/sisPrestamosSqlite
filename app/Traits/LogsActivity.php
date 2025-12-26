<?php

namespace App\Traits;

use App\Models\RegistroActividad;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        foreach (static::getLoggableEvents() as $event) {
            static::$event(function ($model) use ($event) {
                $model->logActivity($event);
            });
        }
    }

    protected static function getLoggableEvents()
    {
        if (isset(static::$logEvents)) {
            return static::$logEvents;
        }

        return ['created', 'updated', 'deleted'];
    }

    public function logActivity($action)
    {
        $oldValues = null;
        $newValues = null;

        if ($action === 'updated') {
            $oldValues = array_intersect_key($this->getRawOriginal(), $this->getDirty());
            $newValues = $this->getDirty();
            
            // Si no hay cambios reales (ej. solo timestamps), no loggeamos
            if (empty($newValues)) return;
        } elseif ($action === 'created') {
            $newValues = $this->toArray();
        } elseif ($action === 'deleted') {
            $oldValues = $this->toArray();
        }

        RegistroActividad::create([
            'user_id' => Auth::id(),
            'model_type' => get_class($this),
            'model_id' => $this->id,
            'action' => $action,
            'description' => $this->getActivityDescription($action),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    protected function getActivityDescription($action)
    {
        $name = class_basename($this);
        return "El modelo {$name} fue {$action}";
    }
}
