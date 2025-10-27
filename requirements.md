# Requirements Document

## Introduction

Sistem WhatsApp Gateway saat ini dapat mengirim pesan dengan typing indicator, namun belum memiliki mekanisme untuk menangani banyak request secara bersamaan dengan delay yang tepat. Fitur ini akan menambahkan message queue dan rate limiting untuk mencegah spam, menghindari banned dari WhatsApp, dan memberikan pengalaman pengiriman yang lebih natural dengan delay antar pesan.

## Glossary

- **Message Queue System**: Sistem antrian yang mengelola pesan-pesan yang akan dikirim secara berurutan
- **Rate Limiter**: Mekanisme pembatasan jumlah pesan yang dapat dikirim dalam periode waktu tertentu
- **Typing Indicator**: Indikator "sedang mengetik" yang ditampilkan kepada penerima sebelum pesan terkirim
- **Delay Configuration**: Pengaturan waktu tunggu antar pengiriman pesan
- **Queue Status**: Status dari antrian pesan (pending, processing, completed, failed)

## Requirements

### Requirement 1

**User Story:** Sebagai developer yang mengintegrasikan WhatsApp Gateway, saya ingin sistem dapat menangani banyak request pengiriman pesan secara bersamaan tanpa overload, sehingga semua pesan dapat terkirim dengan aman dan teratur.

#### Acceptance Criteria

1. WHEN multiple message requests are received simultaneously, THE Message Queue System SHALL enqueue all messages in order of arrival
2. WHILE messages are in the queue, THE Message Queue System SHALL maintain the order and prevent message loss
3. THE Message Queue System SHALL process messages sequentially for each session
4. WHEN a message is being processed, THE Message Queue System SHALL update the queue status to "processing"
5. IF a message fails to send, THEN THE Message Queue System SHALL mark the message as "failed" and continue processing the next message

### Requirement 2

**User Story:** Sebagai administrator sistem, saya ingin mengatur delay antar pengiriman pesan untuk setiap session, sehingga pengiriman terlihat lebih natural dan menghindari deteksi spam oleh WhatsApp.

#### Acceptance Criteria

1. THE Rate Limiter SHALL enforce a configurable minimum delay between consecutive messages for each session
2. WHEN a message is sent, THE Rate Limiter SHALL wait for the configured delay duration before processing the next message
3. THE Rate Limiter SHALL support delay configuration via environment variables with default values
4. THE Rate Limiter SHALL apply delays independently for each session (multi-session support)
5. WHILE a session is in delay period, THE Rate Limiter SHALL queue incoming messages for that session

### Requirement 3

**User Story:** Sebagai developer, saya ingin mendapatkan informasi status antrian pesan, sehingga saya dapat memonitor berapa banyak pesan yang sedang menunggu untuk dikirim.

#### Acceptance Criteria

1. THE Message Queue System SHALL provide an API endpoint to retrieve queue status for a specific session
2. THE Message Queue System SHALL return the number of pending messages in the queue
3. THE Message Queue System SHALL return the number of messages currently being processed
4. THE Message Queue System SHALL return the number of completed messages
5. THE Message Queue System SHALL return the number of failed messages

### Requirement 4

**User Story:** Sebagai developer, saya ingin typing indicator tetap berfungsi dengan durasi yang sesuai dengan panjang pesan, sehingga penerima melihat pengalaman yang natural.

#### Acceptance Criteria

1. WHEN a message is being sent, THE Message Queue System SHALL trigger typing indicator before sending the actual message
2. THE Message Queue System SHALL calculate typing duration based on message length with a maximum of 5 seconds
3. THE Message Queue System SHALL apply typing indicator for text, image, and document messages
4. THE Message Queue System SHALL NOT apply typing indicator for sticker messages
5. WHILE typing indicator is active, THE Message Queue System SHALL wait for the typing duration to complete before sending the message

### Requirement 5

**User Story:** Sebagai administrator sistem, saya ingin sistem memiliki mekanisme anti-spam yang kuat untuk meminimalisir risiko banned oleh WhatsApp, sehingga akun WhatsApp tetap aman saat mengirim banyak pesan.

#### Acceptance Criteria

1. THE Rate Limiter SHALL enforce a maximum number of messages per hour for each session with configurable limits
2. THE Rate Limiter SHALL enforce a maximum number of messages per minute for each session with configurable limits
3. WHEN hourly or per-minute limit is reached, THE Rate Limiter SHALL reject new message requests with appropriate error message
4. THE Rate Limiter SHALL implement random delay variation between messages (e.g., 3-7 seconds) to simulate human behavior
5. THE Rate Limiter SHALL track message count per recipient and enforce per-recipient limits to prevent spam to single number

### Requirement 6

**User Story:** Sebagai developer, saya ingin sistem dapat menangani error dengan graceful, sehingga satu pesan yang gagal tidak menghentikan seluruh antrian.

#### Acceptance Criteria

1. IF a message fails to send due to network error, THEN THE Message Queue System SHALL retry the message up to a configurable maximum retry count
2. IF a message exceeds maximum retry count, THEN THE Message Queue System SHALL mark it as "failed" and move to the next message
3. WHEN a session is disconnected, THE Message Queue System SHALL pause the queue for that session
4. WHEN a session reconnects, THE Message Queue System SHALL resume processing the queue for that session
5. THE Message Queue System SHALL log all errors with session ID, message details, and error reason
