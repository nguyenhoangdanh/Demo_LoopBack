#!/bin/bash
ENV="dev"

# Check the --env tag
for arg in "$@"
do
  case $arg in
    --env=*)
    ENV="${arg#*=}"
    ;;
  esac
done

# Up Docker
case $ENV in
  "prod")
    for service in "$@"
    do
      case $service in
        --env=*)
          shift
          ;;
        "server-1")
          echo "Server 1 is building..."
          docker compose \
          --env-file ./.env.production \
          --env-file ./.env \
          -f ./docker/prod/docker-compose.server.yml \
          up hrm-server-1 -d
          ;;
        "server-2")
          echo "Server 2 is building..."
          docker compose \
          --env-file ./.env.production \
          --env-file ./.env \
          -f ./docker/prod/docker-compose.server.yml \
          up hrm-server-2 -d
          ;;
        "servers")
          echo "All servers are building..."
          docker compose \
          --env-file ./.env.production \
          --env-file ./.env \
          -f ./docker/prod/docker-compose.server.yml \
          up -d
          ;;
        "admin")
          echo "Admin is building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.admin.yml \
          up -d
          ;;
        "pg-0")
          echo "Postgres 0 is building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.postgres.yml \
          up hrm-pg-0 -d
          ;;
        "pg-1")
          echo "Postgres 1 is building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.postgres.yml \
          up hrm-pg-1 -d
          ;;
        "pg-2")
          echo "Postgres 2 is building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.postgres.yml \
          up hrm-pg-2 -d
          ;;
        "pgpool")
          echo "Postgres 2 is building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.postgres.yml \
          up hrm-pgpool -d
          ;;
        "postgres")
          echo "Postgres is building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.postgres.yml \
          up -d
          ;;
        "redis")
          echo "Redis is building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.redis.yml \
          up -d
          ;;
        "minio")
          echo "Minio is building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.minio.yml \
          up -d
          ;;
        "services")
          echo "All services are building..."
          docker compose \
          --env-file ./.env.production \
          -f ./docker/prod/docker-compose.postgres.yml \
          -f ./docker/prod/docker-compose.minio.yml \
          -f ./docker/prod/docker-compose.redis.yml \
          up -d
          ;;
        *)
          echo "Please specifying services in the syntax: ./up.sh <service-1> <service-2> ... --env=prod"
          ;;
      esac
    done
    ;;
  "dev")
    echo "Services are building..."
    docker compose --env-file ./.env.development -f ./docker/dev/docker-compose.yml up -d
    ;;
  *)
    echo "Please following the syntax: ./up.sh <service-1> <service-2> ... --env=dev(default)|prod"
    ;;
esac
