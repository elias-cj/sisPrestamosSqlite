<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public function index()
    {
        $clients = Cliente::latest()->paginate(15)->withQueryString();
        return Inertia::render('Clients/Index', [
            'clients' => $clients
        ]);
    }

    public function create()
    {
        return Inertia::render('Clients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'documento' => 'required|string|unique:clientes,documento',
            'telefono' => 'nullable|string',
            'direccion' => 'nullable|string',
        ]);

        Cliente::create($validated);

        return redirect()->route('clients.index')->with('success', 'Cliente creado correctamente.');
    }

    public function show(Cliente $client)
    {
        return Inertia::render('Clients/Show', [
            'client' => $client->load(['prestamos' => function($q) {
                $q->latest();
            }, 'prestamos.pagos'])
        ]);
    }

    public function edit(Cliente $client)
    {
        return Inertia::render('Clients/Edit', [
            'client' => $client
        ]);
    }

    public function update(Request $request, Cliente $client)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'documento' => 'required|string|unique:clientes,documento,' . $client->id,
            'telefono' => 'nullable|string',
            'direccion' => 'nullable|string',
            'estado_crediticio' => 'required|in:normal,moroso,incobrable',
        ]);

        $client->update($validated);

        return redirect()->route('clients.index')->with('success', 'Cliente actualizado correctamente.');
    }

    public function destroy(Cliente $client)
    {
        return redirect()->back()->with('error', 'No se permite la eliminación de registros para auditoría. Use el estado del cliente.');
    }
}
