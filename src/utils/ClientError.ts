class ClientError extends Error {
  statusCode: number
  details?: unknown

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ClientError'
    this.details = details
  }
}

export default ClientError
