
export interface SMSRequest {
    to: string;
    message: string;
}

export interface SMSResponse {
    success: boolean;
    batchId?: string;
    error?: string;
}

/**
 * Mock SMS Service
 * In a real application, this would integrate with Twilio, AWS SNS, etc.
 */
export async function sendSMS(request: SMSRequest): Promise<SMSResponse> {
    console.log(`\n[SMS SERVICE] ---------------------------------------------------`);
    console.log(`[SMS SERVICE] Sending to: ${request.to}`);
    console.log(`[SMS SERVICE] Message: "${request.message}"`);
    console.log(`[SMS SERVICE] Timestamp: ${new Date().toISOString()}`);
    console.log(`[SMS SERVICE] ---------------------------------------------------\n`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        success: true,
        batchId: `mock-sms-${Date.now()}`
    };
}

/**
 * Helper to determine message for attendance
 */
export function generateAttendanceMessage(studentName: string, lessonTitle: string, status: 'present' | 'absent' | 'late'): string {
    const date = new Date().toLocaleDateString('ar-EG');

    switch (status) {
        case 'present':
            return `تواصل مدرسة إيمان: حضر ابنكم ${studentName} درس "${lessonTitle}" بتاريخ ${date}. شكراً لاهتمامكم.`;
        case 'absent':
            return `تنبيه من مدرسة إيمان: تغيب ابنكم ${studentName} عن درس "${lessonTitle}" بتاريخ ${date}. يرجى المتابعة.`;
        case 'late':
            return `تنبيه من مدرسة إيمان: حضر ابنكم ${studentName} متأخراً لدرس "${lessonTitle}" بتاريخ ${date}.`;
        default:
            return `إشعار من مدرسة إيمان بخصوص درس "${lessonTitle}".`;
    }
}
