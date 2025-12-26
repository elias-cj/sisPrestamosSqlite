<?php

namespace App\Imports;

use App\Models\Cliente;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ClientsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Cliente([
            'nombre'     => $row['nombre'] ?? $row['name'] ?? null,
            'apellido'   => $row['apellido'] ?? $row['lastname'] ?? null, 
            'dni'        => $row['dni'] ?? $row['cedula'] ?? null,
            'telefono'   => $row['telefono'] ?? $row['phone'] ?? null,
            'direccion'  => $row['direccion'] ?? $row['address'] ?? null,
            'email'      => $row['email'] ?? null,
            // Add default values or other fields as necessary
            'estado_crediticio' => 'bueno', // Default
        ]);
    }
}
