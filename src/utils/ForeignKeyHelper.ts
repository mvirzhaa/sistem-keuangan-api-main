import { ConflictError } from "../types/errors.js";

export class ForeignKeyHelper {
  /**
   * Parse foreign key constraint error and return user-friendly message
   * @param error - Database error object
   * @param entityName - Name of the entity being deleted (e.g., "Rekanan", "Potongan")
   * @returns User-friendly error message
   */
  static parseForeignKeyError(error: any, entityName: string): string {
    const errorMessage = error.message || "";

    // Standard message format
    const standardMessage = `Data ${entityName} tidak dapat dihapus karena masih digunakan pada data lain`;

    // Check various foreign key error patterns
    if (
      errorMessage.includes("foreign key constraint") ||
      errorMessage.includes("Foreign key constraint failed") ||
      errorMessage.includes("violates foreign key constraint") ||
      errorMessage.includes("REFERENCE constraint") ||
      errorMessage.includes("cannot delete or update a parent row")
    ) {
      return standardMessage;
    }

    return `Data ${entityName} tidak dapat dihapus karena masih digunakan pada data lain`;
  }

  /**
   * Check if error is a foreign key constraint violation
   * @param error - Database error object
   * @returns true if it's a foreign key constraint error
   */
  static isForeignKeyError(error: any): boolean {
    if (!error || typeof error !== "object") {
      return false;
    }

    // Check error codes
    if ("code" in error) {
      // Prisma/PostgreSQL foreign key violation codes
      if (error.code === "P2003" || error.code === "23503") {
        return true;
      }

      // MySQL foreign key violation codes
      if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "1451") {
        return true;
      }

      // SQLite foreign key violation codes
      if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        return true;
      }
    }

    // Check error messages
    const errorMessage = error.message || "";
    return errorMessage.includes("foreign key") || errorMessage.includes("constraint") || errorMessage.includes("violates") || errorMessage.includes("REFERENCE") || errorMessage.includes("cannot delete or update a parent row");
  }

  /**
   * Handle delete operation with automatic foreign key error handling
   * @param deleteOperation - Function that performs the delete operation
   * @param entityName - Name of the entity being deleted
   * @returns Result of delete operation
   * @throws ConflictError if foreign key constraint violation
   */
  static async handleDelete<T>(deleteOperation: () => Promise<T>, entityName: string): Promise<T> {
    try {
      return await deleteOperation();
    } catch (error) {
      // Check if it's a foreign key constraint error
      if (this.isForeignKeyError(error)) {
        const friendlyMessage = this.parseForeignKeyError(error, entityName);
        throw new ConflictError(friendlyMessage);
      }

      // Re-throw other errors as-is
      throw error;
    }
  }

  /**
   * Validate if entity can be deleted by checking for references
   * @param checkFunction - Function that checks for references
   * @param entityName - Name of the entity being deleted
   * @returns void if can be deleted
   * @throws ConflictError if entity is referenced
   */
  static async validateCanDelete(checkFunction: () => Promise<{ hasReferences: boolean; message?: string }>, entityName: string): Promise<void> {
    try {
      const check = await checkFunction();

      if (check.hasReferences) {
        const message = check.message || `Data ${entityName} tidak dapat dihapus karena masih digunakan pada data lain`;
        throw new ConflictError(message);
      }
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      // If check fails, we'll let the delete operation handle it
      console.warn(`Foreign key check failed for ${entityName}:`, error);
    }
  }
}
