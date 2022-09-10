export interface AddressBook {
  emp_id: string | null;
  first: string;
  last: string;
  email: string;
}

export interface Payroll {
  emp_id: string;
  vacationDays: number;
}

interface Employee {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date | null;
}

export interface EmailApi {
  createBatch(): number;
  queueEmail(
    batchId: number,
    email: string,
    subject: string,
    body: string
  ): void;
  flushBatch(batchId: number): Promise<void>;
}

function yearsSince(startDate: Date, endDate: Date): number {
  const millisecondsPerYear = 365 * 24 * 60 * 60 * 1000;
  return (endDate.getTime() - startDate.getTime()) / millisecondsPerYear;
}

/**
 * We haved decided to grant bonus vacation to every employee, 1 day per year of experience
 * we need to email them a notice.
 */
async function grantVacation(
  emailApi: EmailApi,
  payroll: Payroll[],
  addresses: AddressBook[],
  employees: Employee[]
) {
  let emailBatchId = emailApi.createBatch();
  for (var index in payroll) {
    let payrollInfo = payroll[index];
    let addressInfo = addresses.find((x) => x.emp_id == payrollInfo.emp_id);
    let empInfo = employees.find((x) => x.id == payrollInfo.emp_id);

    let today = new Date();
    const yearsEmployed = yearsSince(empInfo.endDate, today);
    let newVacationBalance = yearsEmployed + payrollInfo.vacationDays;

    emailApi.queueEmail(
      emailBatchId,
      addressInfo.email,
      "Good news!",
      `Dear ${empInfo.name}\n` +
        `based on your ${yearsEmployed} years of employment, you have been granted ${yearsEmployed} days of vacation, bringing your total to ${newVacationBalance}`
    );
  }
  await emailApi.flushBatch(emailBatchId);
}
