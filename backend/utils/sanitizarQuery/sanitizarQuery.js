const sanitizeMongoFilter = (obj, origemConfiavel = false) => {
	const allowedTopLevelOperators = ['$regex', '$text', '$or', '$options', '$exists'];
	const allowedComparisonOperators = ['$gte', '$lte', '$gt', '$lt'];//permitir no data_doc
	const allowedFieldsForComparison = ['data_doc'];
	const allowedInsideText = ['$search', '$language', '$caseSensitive', '$diacriticSensitive'];
	const allowedFieldsForRegex = [
		'titulo_doc', 'id_gerais', 'id_demanda',
		'palavras_chave', 'disciplinas', 'om_autora',
		'obs_gerais', 'autores.SARAM'
	];
	const escapeRegex = (text) => text.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

	const sanitize = (input, context = null, parentKey = '') => {
		if (Array.isArray(input)) {
			if (input.length > 50) {
				throw new Error('Filtro contém array muito grande');
			}
			return input.map(i => sanitize(i, context, parentKey));
		} else if (typeof input === 'object' && input !== null) {
			const sanitized = {};
			for (const key in input) {
				if (key.includes('$') && !key.startsWith('$')) {
					throw new Error(`Campo inválido ou tentativa de injeção: ${key}`);
				}

				// Validação de operadores
				if (key.startsWith('$')) {
					if (context === '$text') {
						if (!allowedInsideText.includes(key)) {
							throw new Error(`Campo não permitido dentro de $text: ${key}`);
						}
					} else if (
						!allowedTopLevelOperators.includes(key) &&
						!allowedComparisonOperators.includes(key)
					) {
						throw new Error(`Operador MongoDB não permitido: ${key}`);
					}
				}

				// Apenas permitir operadores de comparação em campos específicos
				if (allowedComparisonOperators.includes(key)) {
					if (!allowedFieldsForComparison.includes(parentKey)) {
						throw new Error(`Uso de operador ${key} não permitido no campo: ${parentKey}`);
					}
					sanitized[key] = input[key];
					continue;
				}

				if (key === '$text') {
					if (typeof input[key] !== 'object' || !input[key]['$search']) {
						throw new Error('$text precisa conter $search');
					}
					// Apenas $language: 'portuguese' permitido (pode expandir se quiser)
					if (input[key]['$language'] && input[key]['$language'] !== 'portuguese') {
						throw new Error('Idioma de $text não permitido');
					}
				}

				if (key === '$or') {
					if (!Array.isArray(input[key])) {
						throw new Error('$or deve ser um array');
					}
					sanitized[key] = input[key].map(cond => sanitize(cond, null));
					continue;
				}

				if (key === '$regex') {
					if (typeof input[key] !== 'string') {
						throw new Error('$regex deve ser uma string');
					}
					sanitized[key] = escapeRegex(input[key]);
					continue;
				}

				if (key === '$options') {
					if (!/^[i]*$/.test(input[key])) {
						throw new Error('Somente opção "i" é permitida para $options');
					}
					sanitized[key] = input[key];
					continue;
				}

				// Verifica se é um campo com $regex permitido
				if (typeof input[key] === 'object' && input[key] !== null) {
					const fullKey = parentKey ? `${parentKey}.${key}` : key;

					if (
						Object.prototype.hasOwnProperty.call(input[key], '$regex') &&
						!allowedFieldsForRegex.includes(fullKey)
					) {
						throw new Error(`Uso de $regex não permitido no campo: ${fullKey}`);
					}

					sanitized[key] = sanitize(input[key], key, fullKey);
				} else {
					sanitized[key] = input[key];
				}
			}
			return sanitized;
		}

		if (typeof input === 'string' && input.length > 300) {
			throw new Error('Valor de string muito longo');
		}

		return input;
	};

	return sanitize(obj);
};

module.exports = sanitizeMongoFilter;
