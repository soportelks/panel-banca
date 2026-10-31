import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export const matchPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  let password = control.get('contrasenaCliente');
  let confirmPassword = control.get('confirmarContrasena');
  if (password && confirmPassword && password?.value != confirmPassword?.value) {
    return { passwordMismatch: true }
  }
  return null;
}
