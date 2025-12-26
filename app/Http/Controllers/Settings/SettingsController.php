<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $company = Empresa::first();

        if (!$company) {
            $company = new Empresa([
                'nombre' => '',
                'razon_social' => '',
                'direccion' => '',
                'telefono' => '',
                'email' => '',
            ]);
        }

        return Inertia::render('settings/Index', [
            'company' => $company,
            'success' => session('success'),
        ]);
    }
}
