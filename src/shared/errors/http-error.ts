type HttpErrorOptionsType = {
	statusCode: number;
	message: string;
};

const createHttpError = ({statusCode, message}: HttpErrorOptionsType) => {
	const error = new Error(message);
	(error as Error & {statusCode?: number}).statusCode = statusCode;
	return error as Error & {statusCode: number};
};

export default createHttpError;
