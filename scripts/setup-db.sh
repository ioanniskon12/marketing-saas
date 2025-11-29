#!/bin/bash

################################################################################
# Database Setup Script for SocialFlow
#
# This script helps you set up the database by running all migrations
# in the correct order.
#
# Usage:
#   chmod +x scripts/setup-db.sh
#   ./scripts/setup-db.sh
#
# Prerequisites:
#   - Supabase CLI installed (npm install -g supabase)
#   - Supabase project created
#   - Environment variables set in .env.local
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if .env.local exists
check_env_file() {
    print_header "Checking Environment Configuration"

    if [ -f ".env.local" ]; then
        print_success "Found .env.local"
    else
        print_error ".env.local not found"
        echo ""
        echo "Please create .env.local with your Supabase credentials:"
        echo "  cp .env.example .env.local"
        echo ""
        echo "Then add your Supabase URL and keys from:"
        echo "  https://app.supabase.com/project/_/settings/api"
        exit 1
    fi

    # Check for required environment variables
    source .env.local

    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_error "NEXT_PUBLIC_SUPABASE_URL not set in .env.local"
        exit 1
    fi

    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_error "SUPABASE_SERVICE_ROLE_KEY not set in .env.local"
        exit 1
    fi

    print_success "Environment variables configured"
}

# Check if Supabase CLI is installed
check_supabase_cli() {
    print_header "Checking Supabase CLI"

    if command -v supabase &> /dev/null; then
        SUPABASE_VERSION=$(supabase --version)
        print_success "Supabase CLI installed ($SUPABASE_VERSION)"
    else
        print_error "Supabase CLI not installed"
        echo ""
        echo "Install with: npm install -g supabase"
        echo "Or visit: https://supabase.com/docs/guides/cli"
        exit 1
    fi
}

# Display setup options
display_menu() {
    print_header "Database Setup Options"

    echo "Choose your setup method:"
    echo ""
    echo "  1) Automatic Setup (Recommended)"
    echo "     - Uses Supabase CLI to run migrations"
    echo "     - Requires project linked with 'supabase link'"
    echo ""
    echo "  2) Manual Setup Instructions"
    echo "     - Provides SQL to copy/paste into Supabase dashboard"
    echo "     - Good for troubleshooting or custom setups"
    echo ""
    echo "  3) Exit"
    echo ""
    read -p "Enter your choice (1-3): " choice

    case $choice in
        1)
            automatic_setup
            ;;
        2)
            manual_setup
            ;;
        3)
            echo "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            display_menu
            ;;
    esac
}

# Automatic setup using Supabase CLI
automatic_setup() {
    print_header "Automatic Setup"

    # Check if project is linked
    if [ ! -f ".supabase/config.toml" ]; then
        print_warning "Supabase project not linked"
        echo ""
        echo "To link your project:"
        echo "  1. Go to your Supabase dashboard"
        echo "  2. Find your project reference (Settings → General → Reference ID)"
        echo "  3. Run: supabase link --project-ref your-project-ref"
        echo ""
        read -p "Press Enter after linking your project..."
    fi

    # Run migrations
    print_info "Running database migrations..."
    echo ""

    MIGRATION_DIR="supabase/migrations"

    if [ ! -d "$MIGRATION_DIR" ]; then
        print_error "Migration directory not found: $MIGRATION_DIR"
        exit 1
    fi

    # Count migrations
    MIGRATION_COUNT=$(ls -1 $MIGRATION_DIR/*.sql 2>/dev/null | wc -l | tr -d ' ')

    if [ "$MIGRATION_COUNT" -eq 0 ]; then
        print_error "No migration files found in $MIGRATION_DIR"
        exit 1
    fi

    print_info "Found $MIGRATION_COUNT migration files"
    echo ""

    # Ask for confirmation
    read -p "Run all migrations? (y/n): " confirm

    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        print_warning "Setup cancelled"
        exit 0
    fi

    # Run migrations
    echo ""
    supabase db push

    if [ $? -eq 0 ]; then
        print_success "All migrations completed successfully!"
        show_next_steps
    else
        print_error "Migration failed"
        echo ""
        echo "Try manual setup or check Supabase dashboard for errors"
        exit 1
    fi
}

# Manual setup instructions
manual_setup() {
    print_header "Manual Setup Instructions"

    echo "Follow these steps to manually set up your database:"
    echo ""
    echo "1. Go to your Supabase project:"
    echo "   https://app.supabase.com"
    echo ""
    echo "2. Navigate to: SQL Editor"
    echo ""
    echo "3. Run each migration file in order:"
    echo ""

    MIGRATION_DIR="supabase/migrations"

    if [ -d "$MIGRATION_DIR" ]; then
        for file in $MIGRATION_DIR/*.sql; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "   ▸ $filename"
            fi
        done
    fi

    echo ""
    echo "4. Copy the contents of each file and paste into SQL Editor"
    echo ""
    echo "5. Run each migration by clicking 'Run' or pressing Ctrl+Enter"
    echo ""
    echo "6. Verify tables were created in the Table Editor"
    echo ""

    print_info "Migration files are located in: $MIGRATION_DIR"
    echo ""

    read -p "Press Enter to see the first migration file..."

    # Show first migration
    FIRST_MIGRATION=$(ls -1 $MIGRATION_DIR/*.sql 2>/dev/null | head -n 1)

    if [ -f "$FIRST_MIGRATION" ]; then
        echo ""
        print_header "First Migration: $(basename $FIRST_MIGRATION)"
        echo ""
        cat "$FIRST_MIGRATION"
        echo ""
        echo ""
        print_info "Copy the SQL above and paste it into Supabase SQL Editor"
        echo ""
        print_info "After running all migrations, come back and run: npm run dev"
    fi
}

# Show next steps after successful setup
show_next_steps() {
    print_header "Setup Complete! 🎉"

    echo "Your database is ready. Next steps:"
    echo ""
    echo "1. Start the development server:"
    echo "   ${GREEN}npm run dev${NC}"
    echo ""
    echo "2. Open your browser:"
    echo "   ${GREEN}http://localhost:3000${NC}"
    echo ""
    echo "3. Create your first user account"
    echo ""
    echo "4. Connect your social media accounts"
    echo ""

    print_info "Need help? Check out:"
    echo "   • README.md - Getting started guide"
    echo "   • DEPLOYMENT.md - Deployment instructions"
    echo "   • EMAIL_SYSTEM_GUIDE.md - Email configuration"
    echo ""
}

# Main execution
main() {
    clear

    print_header "SocialFlow Database Setup"
    echo "This script will help you set up the database for SocialFlow."
    echo ""

    # Run checks
    check_env_file
    check_supabase_cli

    # Show menu
    display_menu
}

# Run main function
main
