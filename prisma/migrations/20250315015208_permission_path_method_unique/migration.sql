CREATE UNIQUE INDEX "Permission_path_method_unique" 
ON "Permission"("path", "method") 
WHERE "deletedAt" IS NULL;