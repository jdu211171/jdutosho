1. **Modification Scope**
   *Modify only the parts of the code that are directly related to the request.* Do not introduce unrelated refactors or formatting changes.

2. **Preservation**
   *Preserve all existing formatting, original names, comments, annotations, and documentation* exactly as they are, unless an explicit instruction says otherwise.

3. **Code Output**
   *Error Handling: After making modifications, check for errors and fix any issues before finalizing the code output. Additional error-checking steps are not required.Error Handling: After making modifications, check for errors and fix any issues before finalizing the code output. Additional error-checking steps are not required.

4. **httpie Collection Maintenance**
   Whenever an API route is **added** or **modified**:
   * **Add or update** the matching request example in `httpie-collection-jdutosho.json`.
   * Edit only the affected collection item(s); leave all unrelated entries and overall JSON formatting untouched.

5. **Test Coverage Updates**

   * **New routes:** create a dedicated feature-test file (or extend the closest existing one) under `tests/Feature/...` that covers normal behaviour, authentication/authorization, validation rules, and expected error responses.
   * **Updated routes:** locate and adjust the existing test(s) so they match the revised route contract, keeping original file names, comments, and structure intact.
