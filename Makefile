run:
	docker-compose up -d
	npx prisma migrate dev --name new
	npm run start:dev