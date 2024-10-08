use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[cfg(feature = "python")]
use pyo3::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CashFlow {
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub payment_date: NaiveDate,
    pub type_: String,
    pub currency: String,
    pub amount: f64,
}

impl CashFlow {
    pub fn new(
        start_date: NaiveDate,
        end_date: NaiveDate,
        payment_date: NaiveDate,
        type_: String,
        currency: String,
        amount: f64,
    ) -> Self {
        CashFlow {
            start_date,
            end_date,
            payment_date,
            type_,
            currency,
            amount,
        }
    }

    pub fn duration_days(&self) -> i64 {
        (self.end_date - self.start_date).num_days()
    }
}

#[cfg(feature = "python")]
#[pyclass]
pub struct PyCashFlow {
    inner: CashFlow,
}

#[cfg(feature = "python")]
#[pymethods]
impl PyCashFlow {
    #[new]
    fn new(
        start_date: &str,
        end_date: &str,
        payment_date: &str,
        type_: String,
        currency: String,
        amount: f64,
    ) -> PyResult<Self> {
        let start_date = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")?;
        let end_date = NaiveDate::parse_from_str(end_date, "%Y-%m-%d")?;
        let payment_date = NaiveDate::parse_from_str(payment_date, "%Y-%m-%d")?;

        Ok(PyCashFlow {
            inner: CashFlow::new(start_date, end_date, payment_date, type_, currency, amount),
        })
    }

    #[getter]
    fn start_date(&self) -> String {
        self.inner.start_date.format("%Y-%m-%d").to_string()
    }

    #[getter]
    fn end_date(&self) -> String {
        self.inner.end_date.format("%Y-%m-%d").to_string()
    }

    #[getter]
    fn payment_date(&self) -> String {
        self.inner.payment_date.format("%Y-%m-%d").to_string()
    }

    #[getter]
    fn type_(&self) -> String {
        self.inner.type_.clone()
    }

    #[getter]
    fn currency(&self) -> String {
        self.inner.currency.clone()
    }

    #[getter]
    fn amount(&self) -> f64 {
        self.inner.amount
    }

    fn duration_days(&self) -> i64 {
        self.inner.duration_days()
    }
}
