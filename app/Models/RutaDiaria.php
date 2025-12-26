<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RutaDiaria extends Model
{
    use HasFactory;

    protected $table = 'rutas_diarias';

    protected $fillable = [
        'fecha',
        'orden',
        'bloqueada',
        'user_id',
    ];

    protected $casts = [
        'fecha' => 'date',
        'orden' => 'array',
        'bloqueada' => 'boolean',
    ];

    /**
     * Relación con usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'user_id');
    }

    /**
     * Scope para obtener ruta por fecha
     */
    public function scopePorFecha($query, $fecha)
    {
        return $query->where('fecha', $fecha);
    }

    /**
     * Actualizar estado de un cliente en la ruta
     */
    public function actualizarEstadoCliente($clienteId, $estado, $nota = null, $horaEstimada = null)
    {
        $orden = $this->orden ?? [];
        $encontrado = false;
        
        foreach ($orden as &$item) {
            if ($item['cliente_id'] == $clienteId) {
                $item['estado'] = $estado;
                if ($nota !== null) {
                    $item['nota'] = $nota;
                }
                if ($horaEstimada !== null) {
                    $item['hora_estimada'] = $horaEstimada;
                }
                $encontrado = true;
                break;
            }
        }

        if (!$encontrado) {
            $orden[] = [
                'cliente_id' => (int) $clienteId,
                'posicion' => count($orden) + 1,
                'estado' => $estado,
                'nota' => $nota,
                'hora_estimada' => $horaEstimada
            ];
        }
        
        $this->orden = $orden;
        $this->save();
    }

    /**
     * Marcar un cliente como pagado automáticamente
     */
    public function marcarComoPagado($clienteId)
    {
        $orden = $this->orden ?? [];
        $encontrado = false;
        
        foreach ($orden as &$item) {
            if ($item['cliente_id'] == $clienteId) {
                $item['estado'] = 'pagado';
                $encontrado = true;
                break;
            }
        }

        if (!$encontrado) {
            $orden[] = [
                'cliente_id' => (int) $clienteId,
                'posicion' => count($orden) + 1,
                'estado' => 'pagado',
                'nota' => null,
                'hora_estimada' => null
            ];
        }
        
        $this->orden = $orden;
        $this->save();
    }

    /**
     * Obtener estado de un cliente específico
     */
    public function getEstadoCliente($clienteId)
    {
        $orden = $this->orden ?? [];
        
        foreach ($orden as $item) {
            if ($item['cliente_id'] == $clienteId) {
                return $item['estado'] ?? 'pendiente';
            }
        }
        
        return 'pendiente';
    }
}
