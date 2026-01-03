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
        Schema::table('ganancias', function (Blueprint $table) {
            $table->foreignId('pago_id')->nullable()->after('socio_id')->constrained('pagos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ganancias', function (Blueprint $table) {
            $table->dropForeign(['pago_id']);
            $table->dropColumn('pago_id');
        });
    }
};
