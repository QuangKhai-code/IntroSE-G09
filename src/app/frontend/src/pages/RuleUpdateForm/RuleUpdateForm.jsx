import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateField } from "../../store/rules/rules-slice";
import s from "./style.module.css";

import SaveButton from "../../components/SaveButton/SaveButton";
import Input from "../../components/Input/Input";

const ruleFields = [
  { id: "maxPlayer", label: "Số cầu thủ tối đa" },
  { id: "minPlayer", label: "Số cầu thủ tối thiểu" },
  { id: "maxAge", label: "Độ tuổi tối đa" },
  { id: "minAge", label: "Độ tuổi tối thiểu" },
  { id: "win_score", label: "Điểm cần thắng" },
  { id: "lose_score", label: "Điểm thua" },
  { id: "draw_score", label: "Điểm hòa" },
  { id: "goal_type_count", label: "Số loại bàn thắng được tính" },
  { id: "max_goal_time", label: "Thời gian ghi bàn tối đa" },
  { id: "max_foreign_player", label: "Số cầu thủ nước ngoài tối đa" },
];

export default function RuleUpdateForm() {
  const rules = useSelector((store) => store.rulesSlice.rules);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(
    ruleFields.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {})
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    Object.entries(formData).forEach(([field, value]) => {
      if (value !== "") {
        // TODO: validate value before dispatching
        dispatch(updateField({ field, value }));
      }
    });

    alert("Cập nhật thành công!");
    setFormData(ruleFields.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {}));
  };

  return (
    <form className={s.form_container} onSubmit={submit}>
      <div className={s.content}>

        {ruleFields.map(({ id, label }) => (
          <div className={s.input_group} key={id}>
            <label htmlFor={id}>{label}</label>
            <Input
              id={id}
              className={s.input}
              placeholder={String(rules[id] ?? "")}
              value={formData[id]}
              onChange={handleChange}
            />
          </div>
        ))}
      
      </div>

      <SaveButton />
    </form>
  );
}
