<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('registros_actividad', function (Blueprint $table) {
            $table->string('url')->nullable()->after('description');
            $table->string('method', 10)->nullable()->after('url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registros_actividad', function (Blueprint $table) {
            $table->dropColumn(['url', 'method']);
        });
    }
};
