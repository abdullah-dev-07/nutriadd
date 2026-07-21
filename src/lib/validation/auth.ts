const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type LoginFormValues = {
  email: string
  password: string
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'Please enter your email address.'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Please enter your password.'
  }

  return errors
}

export type SignupFormValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export type SignupFormErrors = Partial<Record<keyof SignupFormValues, string>>

export function validateSignupForm(
  values: SignupFormValues
): SignupFormErrors {
  const errors: SignupFormErrors = {}
  const fullName = values.fullName.trim()
  const email = values.email.trim()

  if (!fullName) {
    errors.fullName = 'Please enter your full name.'
  } else if (fullName.length < 2) {
    errors.fullName = 'Name must be at least 2 characters.'
  }

  if (!email) {
    errors.email = 'Please enter your email address.'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Please enter a password.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export type ForgotPasswordFormValues = {
  email: string
}

export type ForgotPasswordFormErrors = Partial<
  Record<keyof ForgotPasswordFormValues, string>
>

export function validateForgotPasswordForm(
  values: ForgotPasswordFormValues
): ForgotPasswordFormErrors {
  const errors: ForgotPasswordFormErrors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'Please enter your email address.'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  return errors
}

export function hasErrors(
  errors:
    | LoginFormErrors
    | SignupFormErrors
    | ForgotPasswordFormErrors
): boolean {
  return Object.keys(errors).length > 0
}
