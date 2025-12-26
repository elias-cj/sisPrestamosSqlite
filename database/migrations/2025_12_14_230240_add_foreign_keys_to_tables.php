<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pagos', function (Blueprint $table) {
            $table->foreign('caja_id')->references('id')->on('cajas');
        });

        Schema::table('empresas', function (Blueprint $table) {
            $table->foreign('moneda_defecto_id')->references('id')->on('monedas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pagos', function (Blueprint $table) {
            $table->dropForeign(['caja_id']);
        });

        Schema::table('empresas', function (Blueprint $table) {
            $table->dropForeign(['moneda_defecto_id']);
        });
    }
};
