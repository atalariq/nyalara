#!/usr/bin/env bash

export PROJECT_ID="nyalara"
export REGION="asia-southeast2"
export SERVICE="nyalara-api-prod"

gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --clear-base-image \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=nyalara,NODE_ENV=production,GEMINI_MODEL=gemini-2.5-flash-lite" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"

# export IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/$SERVICE:$(date +%Y%m%d-%H%M%S)"
#
# gcloud builds submit --tag "$IMAGE" .
#
# gcloud run deploy "$SERVICE" \
#   --image "$IMAGE" \
#   --region "$REGION" \
#   --platform managed \
#   --allow-unauthenticated \
#   --clear-base-image \
#   --set-env-vars "GOOGLE_CLOUD_PROJECT=nyalara,NODE_ENV=production,GEMINI_MODEL=gemini-2.5-flash-lite" \
#   --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"
