package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	db *pgxpool.Pool
}

type HealthResponse struct {
	Status string `json:"status"`
}

type DashboardSummaryResponse struct {
	OrdersToShipToday           int `json:"ordersToShipToday"`
	IncomingGoodsToday          int `json:"incomingGoodsToday"`
	AvailableOperatorsTomorrow  int `json:"availableOperatorsTomorrow"`
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	port := os.Getenv("API_PORT")
	if port == "" {
		port = "3000"
	}

	ctx := context.Background()

	db, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("failed to create database pool: %v", err)
	}
	defer db.Close()

	if err := db.Ping(ctx); err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	app := &App{
		db: db,
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", app.handleHealth)
	mux.HandleFunc("GET /api/dashboard/summary", app.handleDashboardSummary)

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      loggingMiddleware(mux),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Printf("warehouse API listening on port %s", port)

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func (app *App) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, HealthResponse{
		Status: "ok",
	})
}

func (app *App) handleDashboardSummary(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	ordersToShipToday, err := countOrdersToShipToday(ctx, app.db)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to count today's orders")
		log.Printf("countOrdersToShipToday error: %v", err)
		return
	}

	incomingGoodsToday, err := countIncomingGoodsToday(ctx, app.db)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to count today's incoming goods")
		log.Printf("countIncomingGoodsToday error: %v", err)
		return
	}

	availableOperatorsTomorrow, err := countAvailableOperatorsTomorrow(ctx, app.db)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to count tomorrow's available operators")
		log.Printf("countAvailableOperatorsTomorrow error: %v", err)
		return
	}

	writeJSON(w, http.StatusOK, DashboardSummaryResponse{
		OrdersToShipToday:          ordersToShipToday,
		IncomingGoodsToday:         incomingGoodsToday,
		AvailableOperatorsTomorrow: availableOperatorsTomorrow,
	})
}

func countOrdersToShipToday(ctx context.Context, db *pgxpool.Pool) (int, error) {
	var count int

	err := db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM orders
		WHERE shipping_date = CURRENT_DATE
		AND status IN ('pending', 'ready')
	`).Scan(&count)

	return count, err
}

func countIncomingGoodsToday(ctx context.Context, db *pgxpool.Pool) (int, error) {
	var count int

	err := db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM incoming_goods
		WHERE arrival_date = CURRENT_DATE
	`).Scan(&count)

	return count, err
}

func countAvailableOperatorsTomorrow(ctx context.Context, db *pgxpool.Pool) (int, error) {
	var count int

	err := db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM operators
		WHERE status = 'available'
		AND available_date = CURRENT_DATE + INTERVAL '1 day'
	`).Scan(&count)

	return count, err
}

func writeJSON(w http.ResponseWriter, statusCode int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("failed to encode json response: %v", err)
	}
}

func writeError(w http.ResponseWriter, statusCode int, message string) {
	writeJSON(w, statusCode, map[string]string{
		"error": message,
	})
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		next.ServeHTTP(w, r)

		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}