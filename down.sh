#!/bin/bash
ENV="dev"
FLAG=""

# Check the --env tag
for arg in "$@"
do
  case $arg in
    --env=*)
      ENV="${arg#*=}"
      ;;
    -*)
      FLAG="$arg"
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
        -*)
          shift
          ;;
        "server-1")
          echo "Server 1 is building..."
          docker compose \
          -f ./docker/prod/docker-compose.server.yml \
          down $FLAG hrm-server-1
          ;;
        "server-2")
          echo "Server 2 is building..."
          docker compose \
          -f ./docker/prod/docker-compose.server.yml \
          down $FLAG hrm-server-2
          ;;
        "servers")
          echo "All servers are building..."
          docker compose \
          -f ./docker/prod/docker-compose.server.yml \
          down $FLAG
          ;;
        "admin")
          echo "Admin is building..."
          docker compose \
          -f ./docker/prod/docker-compose.admin.yml \
          down $FLAG
          ;;
        "pg-0")
          echo "Postgres 0 is building..."
          docker compose \
          -f ./docker/prod/docker-compose.postgres.yml \
          down $FLAG hrm-pg-0
          ;;
        "pg-1")
          echo "Postgres 1 is building..."
          docker compose \
          -f ./docker/prod/docker-compose.postgres.yml \
          down $FLAG hrm-pg-1
          ;;
        "pg-2")
          echo "Postgres 2 is building..."
          docker compose \
          -f ./docker/prod/docker-compose.postgres.yml \
          down $FLAG hrm-pg-2
          ;;
        "pgpool")
          echo "Postgres 2 is building..."
          docker compose \
          -f ./docker/prod/docker-compose.postgres.yml \
          down $FLAG hrm-pgpool
          ;;
        "postgres")
          echo "Postgres is building..."
          docker compose \
          -f ./docker/prod/docker-compose.postgres.yml \
          down $FLAG
          ;;
        "redis")
          echo "Redis is building..."
          docker compose \
          -f ./docker/prod/docker-compose.redis.yml \
          down $FLAG
          ;;
        "minio")
          echo "Minio is building..."
          docker compose \
          -f ./docker/prod/docker-compose.minio.yml \
          down $FLAG
          ;;
        "services")
          echo "All services are building..."
          docker compose \
          -f ./docker/prod/docker-compose.postgres.yml \
          -f ./docker/prod/docker-compose.minio.yml \
          -f ./docker/prod/docker-compose.redis.yml \
          down $FLAG
          ;;
        *)
          echo "Please specifying services in the syntax: ./down.sh <service-1> <service-2> ... --env=prod"
          ;;
      esac
    done
    ;;
  "dev")
    echo "Services are building..."
    docker compose -f ./docker/dev/docker-compose.yml down $FLAG
    ;;
  *)
    echo "Please following the syntax: ./down.sh <service-1> <service-2> ... --env=dev(default)|prod"
    ;;
esac
