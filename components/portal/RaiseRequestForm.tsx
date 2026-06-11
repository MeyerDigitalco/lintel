"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { raiseRequest } from "@/app/portal/maintenance/actions";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export function RaiseRequestForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Report a problem</Button>;
  }

  return (
    <Card>
      <CardBody>
        <form
          action={async (fd) => {
            await raiseRequest(fd);
            setOpen(false);
          }}
          className="space-y-3"
        >
          <label className="block">
            <span className="mb-1 block text-sm text-ink">What&apos;s the problem?</span>
            <input name="title" required placeholder="e.g. Leaking kitchen tap" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Details</span>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-lintel border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-evergreen/30"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm text-ink">Category</span>
              <select name="category" className={inputCls} defaultValue="other">
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="heating">Heating</option>
                <option value="appliance">Appliance</option>
                <option value="structural">Structural</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-ink">Urgency</span>
              <select name="priority" className={inputCls} defaultValue="routine">
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="is_hazard" className="h-4 w-4" />
            This is a health or safety hazard (e.g. damp, mould, no heating)
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Photos</span>
            <input
              name="photos"
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-slate file:mr-3 file:rounded-lintel file:border file:border-hairline file:bg-paper file:px-3 file:py-2 file:text-sm"
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit">Submit request</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
